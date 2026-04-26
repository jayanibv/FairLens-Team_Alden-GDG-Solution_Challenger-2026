import os
import uuid
from datetime import datetime
from typing import List

import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from bias_detector import calculate_bias
from gemini_service import get_gemini_explanation
from database import save_audit, get_audit, get_all_audits
from sample_data import create_samples

app = FastAPI(title="FairLens API")

# CORS setup
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://fair-lens-audit.web.app",
    "https://fair-lens-audit.firebaseapp.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize samples on startup
create_samples()

class AuditResponse(BaseModel):
    audit_id: str
    severity: str
    filename: str
    total_records: int
    decision_column: str
    timestamp: str
    stats: dict
    explanation: str
    recommendations: List[str]

@app.post("/api/audit")
async def run_audit(
    file: UploadFile = File(...),
    decision_column: str = Form(...),
    demographic_columns: str = Form(...),
    x_user_id: str = Header(None)
):
    # 1. Validate input
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required for privacy isolation")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail={
            "error": True,
            "code": "INVALID_FILE_TYPE",
            "message": "Only CSV files are allowed"
        })
    
    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail={
            "error": True,
            "code": "CORRUPT_FILE",
            "message": f"Could not read CSV: {str(e)}"
        })
        
    if len(df) < 10:
        raise HTTPException(status_code=400, detail={
            "error": True,
            "code": "INSUFFICIENT_DATA",
            "message": "Dataset must have at least 10 rows for statistical significance"
        })
        
    demographics = [c.strip() for c in demographic_columns.split(',')]
    
    if decision_column not in df.columns:
        raise HTTPException(status_code=400, detail={
            "error": True,
            "code": "COLUMN_NOT_FOUND",
            "message": f"Decision column '{decision_column}' not found"
        })
        
    for col in demographics:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail={
                "error": True,
                "code": "COLUMN_NOT_FOUND",
                "message": f"Demographic column '{col}' not found"
            })

    # 2. Statistical Analysis
    try:
        stats, severity = calculate_bias(df, decision_column, demographics)
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "error": True,
            "code": "ANALYSIS_ERROR",
            "message": f"Error during statistical analysis: {str(e)}"
        })
    
    # 3. Gemini Explanation
    explanation_data = get_gemini_explanation(stats)

    # 4. Save to Firestore
    audit_id = str(uuid.uuid4())
    audit_data = {
        "audit_id": audit_id,
        "user_id": x_user_id, # Link audit to specific user
        "severity": severity,
        "filename": file.filename,
        "total_records": len(df),
        "decision_column": decision_column,
        "timestamp": datetime.utcnow().isoformat(),
        "stats": stats,
        "explanation": explanation_data["explanation"],
        "recommendations": explanation_data["recommendations"]
    }
    
    save_audit(audit_data)
    
    return audit_data

@app.get("/api/audit/{audit_id}")
async def get_single_audit(audit_id: str, x_user_id: str = Header(None)):
    audit = get_audit(audit_id, x_user_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found or access denied")
    return audit

@app.get("/api/history")
async def get_audit_history(x_user_id: str = Header(None)):
    print(f"DEBUG: Fetching history for User ID: {x_user_id}")
    if not x_user_id:
        return {"audits": []}
    
    audits = get_all_audits(x_user_id)
    # Final safety filter: ensure only audits matching this user_id are returned
    isolated_audits = [a for a in audits if a.get('user_id') == x_user_id]
    
    print(f"DEBUG: Found {len(isolated_audits)} isolated audits")
    return {"audits": isolated_audits}

@app.get("/api/sample/{type}")
async def get_sample(type: str):
    file_path = f"samples/{type}_sample.csv"
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=f"{type}_sample.csv", media_type="text/csv")
    raise HTTPException(status_code=404, detail="Sample not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

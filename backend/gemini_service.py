import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_gemini_explanation(stats_json):
    # Using gemini-2.5-flash as requested
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    system_prompt = """You are an HR compliance advisor. A non-technical HR manager 
needs to understand bias statistics from their dataset.
Return ONLY valid JSON, no markdown, no explanation outside JSON.

Input stats: {stats_json}

Return exactly:
{{
  "explanation": "3-4 sentence paragraph in plain English. Mention specific groups, actual percentages, reference the EEOC four-fifths rule. No jargon. Write as if explaining before a legal audit.",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ]
}}"""

    prompt = system_prompt.format(stats_json=json.dumps(stats_json))
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Robust JSON extraction
        if "{" in text and "}" in text:
            start = text.find("{")
            end = text.rfind("}") + 1
            text = text[start:end]
            
        return json.loads(text)
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        # Provide more specific fallback if possible
        return {
            "explanation": "Could not generate AI explanation at this time. Please review the raw statistics below.",
            "recommendations": [
                "Review manual selection processes for potential unconscious bias.",
                "Implement blind resume screening or standardized scoring.",
                "Conduct diversity and inclusion training for decision makers."
            ]
        }

import pandas as pd
import os

def create_samples():
    os.makedirs("samples", exist_ok=True)
    
    # Hiring Sample
    hiring_data = [
        {"candidate_id": "C001", "gender": "Male", "age": 25, "education": "Bachelors", "experience_years": 3, "zip_code": "10001", "selected": 1},
        {"candidate_id": "C002", "gender": "Male", "age": 28, "education": "Masters", "experience_years": 5, "zip_code": "10002", "selected": 1},
        {"candidate_id": "C003", "gender": "Male", "age": 35, "education": "Bachelors", "experience_years": 10, "zip_code": "10003", "selected": 1},
        {"candidate_id": "C004", "gender": "Male", "age": 42, "education": "PhD", "experience_years": 15, "zip_code": "10004", "selected": 0},
        {"candidate_id": "C005", "gender": "Male", "age": 22, "education": "Bachelors", "experience_years": 1, "zip_code": "10005", "selected": 1},
        {"candidate_id": "C006", "gender": "Male", "age": 30, "education": "Masters", "experience_years": 7, "zip_code": "10001", "selected": 1},
        {"candidate_id": "C007", "gender": "Male", "age": 45, "education": "Bachelors", "experience_years": 20, "zip_code": "10002", "selected": 0},
        {"candidate_id": "C008", "gender": "Male", "age": 27, "education": "PhD", "experience_years": 4, "zip_code": "10003", "selected": 1},
        {"candidate_id": "C009", "gender": "Male", "age": 33, "education": "Masters", "experience_years": 8, "zip_code": "10004", "selected": 1},
        {"candidate_id": "C010", "gender": "Male", "age": 48, "education": "Bachelors", "experience_years": 25, "zip_code": "10005", "selected": 1},
        
        {"candidate_id": "C011", "gender": "Female", "age": 24, "education": "Bachelors", "experience_years": 2, "zip_code": "10001", "selected": 1},
        {"candidate_id": "C012", "gender": "Female", "age": 29, "education": "Masters", "experience_years": 6, "zip_code": "10002", "selected": 0},
        {"candidate_id": "C013", "gender": "Female", "age": 36, "education": "Bachelors", "experience_years": 11, "zip_code": "10003", "selected": 0},
        {"candidate_id": "C014", "gender": "Female", "age": 43, "education": "PhD", "experience_years": 16, "zip_code": "10004", "selected": 0},
        {"candidate_id": "C015", "gender": "Female", "age": 23, "education": "Bachelors", "experience_years": 1, "zip_code": "10005", "selected": 1},
        {"candidate_id": "C016", "gender": "Female", "age": 31, "education": "Masters", "experience_years": 8, "zip_code": "10001", "selected": 0},
        {"candidate_id": "C017", "gender": "Female", "age": 46, "education": "Bachelors", "experience_years": 22, "zip_code": "10002", "selected": 0},
        {"candidate_id": "C018", "gender": "Female", "age": 28, "education": "PhD", "experience_years": 5, "zip_code": "10003", "selected": 1},
        {"candidate_id": "C019", "gender": "Female", "age": 34, "education": "Masters", "experience_years": 9, "zip_code": "10004", "selected": 0},
        {"candidate_id": "C020", "gender": "Female", "age": 49, "education": "Bachelors", "experience_years": 27, "zip_code": "10005", "selected": 0},
    ]
    pd.DataFrame(hiring_data).to_csv("samples/hiring_sample.csv", index=False)
    
    # Loan Sample
    loan_data = [
        {"applicant_id": "L001", "gender": "Male", "age": 30, "income": 75000, "credit_score": 720, "neighborhood": "Downtown", "approved": 1},
        {"applicant_id": "L002", "gender": "Female", "age": 32, "income": 80000, "credit_score": 740, "neighborhood": "Westside", "approved": 0},
        {"applicant_id": "L003", "gender": "Male", "age": 45, "income": 120000, "credit_score": 800, "neighborhood": "Eastside", "approved": 1},
        {"applicant_id": "L004", "gender": "Female", "age": 48, "income": 130000, "credit_score": 810, "neighborhood": "Northside", "approved": 0},
        {"applicant_id": "L005", "gender": "Male", "age": 25, "income": 45000, "credit_score": 650, "neighborhood": "Downtown", "approved": 1},
        {"applicant_id": "L006", "gender": "Female", "age": 27, "income": 48000, "credit_score": 670, "neighborhood": "Westside", "approved": 1},
        {"applicant_id": "L007", "gender": "Male", "age": 55, "income": 150000, "credit_score": 820, "neighborhood": "Eastside", "approved": 1},
        {"applicant_id": "L008", "gender": "Female", "age": 58, "income": 160000, "credit_score": 840, "neighborhood": "Northside", "approved": 0},
        {"applicant_id": "L009", "gender": "Male", "age": 35, "income": 90000, "credit_score": 750, "neighborhood": "Downtown", "approved": 1},
        {"applicant_id": "L010", "gender": "Female", "age": 38, "income": 95000, "credit_score": 770, "neighborhood": "Westside", "approved": 1},
        # ... adding more to reach 20
    ]
    # Filling up to 20 with similar pattern
    for i in range(11, 21):
        is_male = i % 2 == 0
        loan_data.append({
            "applicant_id": f"L{i:03d}",
            "gender": "Male" if is_male else "Female",
            "age": 20 + i * 2,
            "income": 50000 + i * 5000,
            "credit_score": 600 + i * 10,
            "neighborhood": "Suburb" if i > 15 else "Urban",
            "approved": 1 if is_male or i < 15 else 0
        })
    pd.DataFrame(loan_data).to_csv("samples/loan_sample.csv", index=False)
    
    # Medical Sample
    medical_data = [
        {"patient_id": "P001", "gender": "Male", "age": 45, "race": "White", "insurance_type": "Private", "diagnosis": "Hypertension", "treatment_recommended": 1},
        {"patient_id": "P002", "gender": "Female", "age": 52, "race": "Black", "insurance_type": "Medicare", "diagnosis": "Hypertension", "treatment_recommended": 0},
        {"patient_id": "P003", "gender": "Male", "age": 60, "race": "White", "insurance_type": "Private", "diagnosis": "Type 2 Diabetes", "treatment_recommended": 1},
        {"patient_id": "P004", "gender": "Female", "age": 65, "race": "Hispanic", "insurance_type": "Medicaid", "diagnosis": "Type 2 Diabetes", "treatment_recommended": 0},
        # ... adding more to reach 20
    ]
    for i in range(5, 21):
        is_white = i % 3 == 0
        medical_data.append({
            "patient_id": f"P{i:03d}",
            "gender": "Male" if i % 2 == 0 else "Female",
            "age": 30 + i,
            "race": "White" if is_white else "Other",
            "insurance_type": "Private" if i % 2 == 0 else "Uninsured",
            "diagnosis": "Condition X",
            "treatment_recommended": 1 if is_white or i % 4 != 0 else 0
        })
    pd.DataFrame(medical_data).to_csv("samples/medical_sample.csv", index=False)

if __name__ == "__main__":
    create_samples()

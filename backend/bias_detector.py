import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency

def calculate_bias(df, decision_col, demographic_cols):
    results = {}
    overall_severity = "LOW"
    
    # Validation
    if decision_col not in df.columns:
        raise ValueError(f"Decision column '{decision_col}' not found")
    
    for col in demographic_cols:
        if col not in df.columns:
            continue
            
        temp_df = df.copy()
        
        # Age bucketing logic
        if "age" in col.lower():
            def bucket_age(age):
                try:
                    age = int(age)
                    if age <= 30: return "20-30"
                    if age <= 40: return "31-40"
                    if age <= 50: return "41-50"
                    return "51+"
                except:
                    return "Unknown"
            temp_df[col] = temp_df[col].apply(bucket_age)
            analysis_col = col
        else:
            analysis_col = col
            
        # Calculate rates per group
        groups = {}
        unique_groups = temp_df[analysis_col].unique()
        
        for group_name in unique_groups:
            group_df = temp_df[temp_df[analysis_col] == group_name]
            total = len(group_df)
            selected = len(group_df[group_df[decision_col] == 1])
            rate = selected / total if total > 0 else 0
            
            # Ensure group_name is a string and stats are native types
            groups[str(group_name)] = {
                "count": int(total),
                "selected": int(selected),
                "rate": float(round(rate, 3))
            }
            
        # Find reference group (highest selection rate)
        if not groups:
            continue
            
        reference_group = max(groups, key=lambda x: groups[x]["rate"])
        ref_rate = groups[reference_group]["rate"]
        
        # Calculate Disparate Impact Ratio (DIR)
        disparate_impact = {}
        is_biased = False
        
        for group_name, stats in groups.items():
            if group_name == reference_group:
                continue
                
            dir_val = stats["rate"] / ref_rate if ref_rate > 0 else 1.0
            disparate_impact[group_name] = round(dir_val, 3)
            
            if dir_val < 0.80:
                is_biased = True
                if dir_val < 0.50:
                    overall_severity = "CRITICAL"
                elif dir_val < 0.65 and overall_severity != "CRITICAL":
                    overall_severity = "HIGH"
                elif dir_val < 0.80 and overall_severity not in ["CRITICAL", "HIGH"]:
                    overall_severity = "MEDIUM"

        # Chi-square test
        # Create contingency table
        contingency = []
        for group_name in unique_groups:
            g_str = str(group_name)
            contingency.append([groups[g_str]["selected"], groups[g_str]["count"] - groups[g_str]["selected"]])
        
        try:
            chi2, p_value, dof, expected = chi2_contingency(contingency)
            is_significant = p_value < 0.05
        except:
            p_value = 1.0
            is_significant = False
            
        results[analysis_col] = {
            "groups": groups,
            "reference_group": str(reference_group),
            "disparate_impact": disparate_impact,
            "biased": bool(is_biased),
            "p_value": round(float(p_value), 4),
            "significant": bool(is_significant)
        }
        
    return results, overall_severity

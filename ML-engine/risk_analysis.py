import joblib
import pandas as pd

# Load trained ML model
model = joblib.load("risk_model.pkl")


def analyze_project(
    cost_escalation,
    schedule_delay,
    expenditure,
    physical_progress
):
    # Prepare project data for ML model
    project = pd.DataFrame([{
        "cost_escalation": cost_escalation,
        "schedule_delay": schedule_delay,
        "expenditure": expenditure,
        "physical_progress": physical_progress
    }])

    # ML prediction
    prediction = model.predict(project)[0]

    # Prediction confidence
    probabilities = model.predict_proba(project)[0]
    confidence = max(probabilities) * 100

    # Calculate expenditure-progress gap
    progress_gap = expenditure - physical_progress

    # ------------------------------------------------
    # RISK FACTOR ANALYSIS
    # ------------------------------------------------

    risk_factors = []

    # Cost escalation
    if cost_escalation > 20:
        risk_factors.append({
            "factor": "Cost Escalation",
            "value": cost_escalation,
            "severity": "CRITICAL",
            "reason": "Project cost has increased significantly."
        })
    elif cost_escalation > 10:
        risk_factors.append({
            "factor": "Cost Escalation",
            "value": cost_escalation,
            "severity": "HIGH",
            "reason": "Project cost is increasing beyond the normal range."
        })

    # Schedule delay
    if schedule_delay > 30:
        risk_factors.append({
            "factor": "Schedule Delay",
            "value": schedule_delay,
            "severity": "CRITICAL",
            "reason": "The project is experiencing severe schedule delays."
        })
    elif schedule_delay > 20:
        risk_factors.append({
            "factor": "Schedule Delay",
            "value": schedule_delay,
            "severity": "HIGH",
            "reason": "The project is experiencing significant delays."
        })

    # Expenditure-progress gap
    if progress_gap > 30:
        risk_factors.append({
            "factor": "Expenditure vs Physical Progress",
            "value": progress_gap,
            "severity": "CRITICAL",
            "reason": "Spending is far ahead of actual physical progress."
        })
    elif progress_gap > 20:
        risk_factors.append({
            "factor": "Expenditure vs Physical Progress",
            "value": progress_gap,
            "severity": "HIGH",
            "reason": "Spending is significantly ahead of physical progress."
        })

    # Expenditure
    if expenditure > 85:
        risk_factors.append({
            "factor": "Expenditure",
            "value": expenditure,
            "severity": "CRITICAL",
            "reason": "A very large portion of the project budget has been spent."
        })
    elif expenditure > 70:
        risk_factors.append({
            "factor": "Expenditure",
            "value": expenditure,
            "severity": "HIGH",
            "reason": "Project expenditure is already high."
        })

    # ------------------------------------------------
    # MAIN RISK FACTORS
    # ------------------------------------------------

    severity_order = {
        "CRITICAL": 3,
        "HIGH": 2,
        "MEDIUM": 1
    }

    risk_factors.sort(
        key=lambda x: severity_order[x["severity"]],
        reverse=True
    )

    main_risks = risk_factors[:3]

    # ------------------------------------------------
    # PROJECT EXPLANATION
    # ------------------------------------------------

    if prediction == "CRITICAL":
        explanation = (
            "The project is at critical risk due to multiple "
            "indicators showing significant deviation in cost, "
            "schedule, expenditure, or physical progress."
        )

    elif prediction == "HIGH":
        explanation = (
            "The project is classified as high risk because "
            "expenditure, schedule performance, cost escalation, "
            "and physical progress indicate significant deviations."
        )

    elif prediction == "MEDIUM":
        explanation = (
            "The project shows moderate risk indicators. "
            "Early monitoring and corrective action can prevent "
            "the situation from becoming more serious."
        )

    else:
        explanation = (
            "The project currently shows low risk indicators "
            "and appears to be progressing within acceptable limits."
        )

    # ------------------------------------------------
    # RECOMMENDATIONS
    # ------------------------------------------------

    recommendations = []

    if schedule_delay > 20:
        recommendations.append(
            "Conduct an immediate schedule review and identify the causes of delay."
        )

    if cost_escalation > 10:
        recommendations.append(
            "Review cost overruns and investigate the reasons for cost escalation."
        )

    if progress_gap > 20:
        recommendations.append(
            "Investigate the expenditure-progress mismatch and verify completed work."
        )

    if expenditure > 70:
        recommendations.append(
            "Closely monitor remaining budget utilization."
        )

    if not recommendations:
        recommendations.append(
            "Continue regular project monitoring."
        )

    # ------------------------------------------------
    # FINAL ANALYTICS RESULT
    # ------------------------------------------------

    return {
        "risk_level": prediction,
        "confidence": round(confidence, 2),
        "explanation": explanation,
        "progress_gap": progress_gap,
        "main_risk_factors": main_risks,
        "recommendations": recommendations
    }


# ------------------------------------------------
# TEST PROJECT
# ------------------------------------------------

if __name__ == "__main__":
    result = analyze_project(
        cost_escalation=18,
        schedule_delay=25,
        expenditure=80,
        physical_progress=55
    )

    print("===================================")
    print("       AI / ANALYTICS ENGINE")
    print("===================================")

    print("Risk Level:", result["risk_level"])
    print("Confidence:", result["confidence"], "%")
    print("Progress Gap:", result["progress_gap"], "%")

    print("\nWhy is the project risky?")
    print(result["explanation"])

    print("\nMain Risk Factors:")

    for risk in result["main_risk_factors"]:
        print(
            f"- {risk['factor']}: "
            f"{risk['value']}% | "
            f"{risk['severity']}"
        )
        print(f"  Reason: {risk['reason']}")

    print("\nRecommendations:")

    for recommendation in result["recommendations"]:
        print("-", recommendation)

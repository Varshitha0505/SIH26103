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
    # Create project data
    project = pd.DataFrame([{
        "cost_escalation": cost_escalation,
        "schedule_delay": schedule_delay,
        "expenditure": expenditure,
        "physical_progress": physical_progress
    }])

    # ML prediction
    prediction = model.predict(project)[0]

    # Prediction probability
    probabilities = model.predict_proba(project)[0]
    classes = model.classes_

    confidence = max(probabilities) * 100

    # Progress gap
    progress_gap = expenditure - physical_progress

    # Identify major risk factors
    risk_factors = []

    if cost_escalation > 20:
        risk_factors.append("Very high cost escalation")
    elif cost_escalation > 10:
        risk_factors.append("Moderate cost escalation")

    if schedule_delay > 30:
        risk_factors.append("Severe schedule delay")
    elif schedule_delay > 20:
        risk_factors.append("Significant schedule delay")

    if progress_gap > 30:
        risk_factors.append("Very large expenditure-progress gap")
    elif progress_gap > 20:
        risk_factors.append("Large expenditure-progress gap")

    if expenditure > 85:
        risk_factors.append("Very high expenditure")
    elif expenditure > 70:
        risk_factors.append("High expenditure")

    # Recommended action
    if prediction == "CRITICAL":
        action = "Immediate intervention and detailed project review required."
    elif prediction == "HIGH":
        action = "Project should be closely monitored and corrective action should be taken."
    elif prediction == "MEDIUM":
        action = "Increase monitoring and investigate emerging risks."
    else:
        action = "Continue regular project monitoring."

    return prediction, confidence, progress_gap, risk_factors, action


# Test project
result = analyze_project(
    cost_escalation=18,
    schedule_delay=25,
    expenditure=80,
    physical_progress=55
)

prediction, confidence, gap, factors, action = result

print("===================================")
print("       PROJECT RISK ANALYSIS")
print("===================================")

print("Risk Level:", prediction)
print("Confidence:", round(confidence, 2), "%")
print("Progress Gap:", gap, "%")

print("\nRisk Factors:")

if factors:
    for factor in factors:
        print("-", factor)
else:
    print("- No major risk factors detected")

print("\nRecommended Action:")
print(action)

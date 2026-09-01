from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load trained ML model
model = joblib.load("risk_model.pkl")


@app.route("/")
def home():
    return jsonify({
        "message": "Project Risk Prediction API is running",
        "status": "success"
    })


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    # Get project inputs
    cost_escalation = data["cost_escalation"]
    schedule_delay = data["schedule_delay"]
    expenditure = data["expenditure"]
    physical_progress = data["physical_progress"]

    # Calculate progress gap
    progress_gap = expenditure - physical_progress

    # Prepare input for ML model
    project = pd.DataFrame([{
        "cost_escalation": cost_escalation,
        "schedule_delay": schedule_delay,
        "expenditure": expenditure,
        "physical_progress": physical_progress
    }])

    # ML prediction
    prediction = model.predict(project)[0]

    # Probability
    probabilities = model.predict_proba(project)[0]
    confidence = max(probabilities) * 100

    # Risk factors
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

    return jsonify({
        "risk_level": prediction,
        "confidence": round(confidence, 2),
        "progress_gap": progress_gap,
        "risk_factors": risk_factors,
        "recommended_action": action
    })


if __name__ == "__main__":
    app.run(debug=True)
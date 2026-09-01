import joblib
import pandas as pd

# Load trained ML model
model = joblib.load("risk_model.pkl")

# New project data
project = pd.DataFrame([{
    "cost_escalation": 18,
    "schedule_delay": 25,
    "expenditure": 80,
    "physical_progress": 55
}])

# Predict risk level
prediction = model.predict(project)[0]

# Get prediction probabilities
probabilities = model.predict_proba(project)[0]
classes = model.classes_

print("ML Risk Prediction:", prediction)

print("\nRisk Probabilities:")
for risk, probability in zip(classes, probabilities):
    print(f"{risk}: {probability * 100:.2f}%")
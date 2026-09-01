import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
data = pd.read_csv("data/risk_data.csv")

# Input features
X = data[
    [
        "cost_escalation",
        "schedule_delay",
        "expenditure",
        "physical_progress"
    ]
]

# Target variable
y = data["risk_level"]

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Create ML model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

# Test model
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print("Model trained successfully!")
print("Accuracy:", round(accuracy * 100, 2), "%")

# Save trained model
joblib.dump(model, "risk_model.pkl")

print("Model saved as risk_model.pkl")

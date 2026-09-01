import pandas as pd
import joblib
import os


# ------------------------------------------------
# FILE PATHS
# ------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "ml-engine",
    "data",
    "processed_projects.csv"
)

MODEL_FILE = os.path.join(
    BASE_DIR,
    "ml-engine",
    "risk_model.pkl"
)

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "ml-engine",
    "data",
    "project_predictions.csv"
)


# ------------------------------------------------
# LOAD DATA
# ------------------------------------------------

print("Loading processed project data...")

df = pd.read_csv(INPUT_FILE)

print(f"Projects loaded: {len(df)}")


# ------------------------------------------------
# LOAD ML MODEL
# ------------------------------------------------

print("Loading trained ML model...")

model = joblib.load(MODEL_FILE)


# ------------------------------------------------
# ML FEATURES
# ------------------------------------------------

features = [
    "cost_escalation",
    "schedule_delay",
    "expenditure",
    "physical_progress"
]

X = df[features]


# ------------------------------------------------
# PREDICT RISK
# ------------------------------------------------

print("Running risk prediction...")

df["risk_level"] = model.predict(X)


# ------------------------------------------------
# PREDICTION CONFIDENCE
# ------------------------------------------------

if hasattr(model, "predict_proba"):

    probabilities = model.predict_proba(X)

    df["confidence"] = (
        probabilities.max(axis=1) * 100
    ).round(2)

else:

    df["confidence"] = None


# ------------------------------------------------
# RISK FACTOR SUMMARY
# ------------------------------------------------

def get_risk_factor(row):

    factors = []

    if row["cost_escalation"] > 20:
        factors.append("High Cost Escalation")

    elif row["cost_escalation"] > 10:
        factors.append("Cost Escalation")

    if row["schedule_delay"] > 30:
        factors.append("Severe Schedule Delay")

    elif row["schedule_delay"] > 20:
        factors.append("Schedule Delay")

    progress_gap = (
        row["expenditure"]
        - row["physical_progress"]
    )

    if progress_gap > 30:
        factors.append("High Expenditure-Progress Gap")

    elif progress_gap > 20:
        factors.append("Expenditure-Progress Gap")

    if row["expenditure"] > 85:
        factors.append("Very High Expenditure")

    elif row["expenditure"] > 70:
        factors.append("High Expenditure")

    if not factors:
        factors.append("No major risk factor")

    return ", ".join(factors)


df["risk_factors"] = df.apply(
    get_risk_factor,
    axis=1
)


# ------------------------------------------------
# PROGRESS GAP
# ------------------------------------------------

df["progress_gap"] = (
    df["expenditure"]
    - df["physical_progress"]
).round(2)


# ------------------------------------------------
# SAVE PREDICTIONS
# ------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ------------------------------------------------
# DISPLAY SUMMARY
# ------------------------------------------------

print("\n======================================")
print("     ML RISK PREDICTION COMPLETE")
print("======================================")

print(f"Total projects : {len(df)}")
print(f"Output file    : {OUTPUT_FILE}")

print("\nRisk Distribution:")

print(
    df["risk_level"]
    .value_counts()
    .to_string()
)

print("\nSample Predictions:")

print(
    df[
        [
            "Project Name",
            "risk_level",
            "confidence",
            "progress_gap",
            "risk_factors"
        ]
    ]
    .head(10)
    .to_string(index=False)
)

print("\n======================================")
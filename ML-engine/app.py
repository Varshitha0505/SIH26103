from flask import Flask, request, jsonify
from risk_analysis import analyze_project
from flask_cors import CORS
import sys
import os
import pandas as pd

# Allow Flask to access the ai-analytics folder
sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "ai-analytics")
    )
)

from analytics import calculate_analytics

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PREDICTIONS_FILE = os.path.join(
    BASE_DIR,
    "data",
    "project_predictions.csv"
)


@app.route("/")
def home():
    return jsonify({
        "message": "Project Risk Prediction API is running",
        "status": "success"
    })


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    cost_escalation = data["cost_escalation"]
    schedule_delay = data["schedule_delay"]
    expenditure = data["expenditure"]
    physical_progress = data["physical_progress"]

    result = analyze_project(
        cost_escalation,
        schedule_delay,
        expenditure,
        physical_progress
    )

    return jsonify(result)


@app.route("/analytics", methods=["POST"])
def analytics():

    data = request.get_json()

    projects = data.get("projects", [])

    result = calculate_analytics(projects)

    return jsonify(result)


# NEW: Get predictions for all projects
@app.route("/projects", methods=["GET"])
def projects():

    try:

        df = pd.read_csv(PREDICTIONS_FILE)

        # Convert NaN values to empty strings
        df = df.fillna("")

        projects = df.to_dict(orient="records")

        return jsonify({
            "status": "success",
            "total_projects": len(projects),
            "projects": projects
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
from flask import Flask, request, jsonify
from risk_analysis import analyze_project

app = Flask(__name__)


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

    # Run ML + AI Analytics
    result = analyze_project(
        cost_escalation,
        schedule_delay,
        expenditure,
        physical_progress
    )

    # Return complete analysis
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
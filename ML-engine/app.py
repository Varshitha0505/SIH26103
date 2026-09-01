from flask import Flask, request, jsonify
from flask_cors import CORS
from risk_analysis import analyze_project

import sys
import os
import pandas as pd

# --------------------------------------------------
# AI ANALYTICS PATH
# --------------------------------------------------

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "ai-analytics")
    )
)

from analytics import calculate_analytics


# --------------------------------------------------
# APP CONFIGURATION
# --------------------------------------------------

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PREDICTIONS_FILE = os.path.join(
    BASE_DIR,
    "data",
    "project_predictions.csv"
)

PROJECTS_FILE = os.path.join(
    BASE_DIR,
    "..",
    "data",
    "projects.csv"
)


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/")
def home():
    return jsonify({
        "message": "Project Risk Prediction API is running",
        "status": "success"
    })


# --------------------------------------------------
# EXISTING RISK PREDICTION
# --------------------------------------------------

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


# --------------------------------------------------
# EXISTING ANALYTICS
# --------------------------------------------------

@app.route("/analytics", methods=["POST"])
def analytics():

    data = request.get_json()

    projects = data.get("projects", [])

    result = calculate_analytics(projects)

    return jsonify(result)


# --------------------------------------------------
# PROJECTS
# --------------------------------------------------

@app.route("/projects", methods=["GET"])
def projects():

    try:

        df = pd.read_csv(PREDICTIONS_FILE)

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


# --------------------------------------------------
# COST OVERRUN ANALYSIS
# --------------------------------------------------

@app.route("/cost-overruns", methods=["GET"])
def cost_overruns():

    try:

        df = pd.read_csv(PROJECTS_FILE)

        df = df.fillna("")

        results = []

        for _, row in df.iterrows():

            original_cost = float(row["Original Cost"])
            revised_cost = float(row["Revised Cost"])

            if original_cost > 0:

                escalation = (
                    (revised_cost - original_cost)
                    / original_cost
                ) * 100

            else:

                escalation = 0

            if escalation >= 20:
                risk = "CRITICAL"

            elif escalation >= 10:
                risk = "HIGH"

            elif escalation > 0:
                risk = "MEDIUM"

            else:
                risk = "LOW"

            results.append({
                "project_id": int(row["Sl. No"]),
                "project_name": row["Project Name"],
                "state": row["State"],
                "agency": row["Agency"],
                "original_cost": original_cost,
                "revised_cost": revised_cost,
                "cost_overrun_percent": round(escalation, 2),
                "cost_overrun_risk": risk
            })

        return jsonify({
            "status": "success",
            "total_projects": len(results),
            "projects": results
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# --------------------------------------------------
# TIME OVERRUN ANALYSIS
# --------------------------------------------------

@app.route("/time-overruns", methods=["GET"])
def time_overruns():

    try:

        df = pd.read_csv(PROJECTS_FILE)

        df = df.fillna("")

        results = []

        for _, row in df.iterrows():

            target_doc = str(row["Target DoC"]).strip()
            revised_doc = str(row["Revised DoC"]).strip()

            delay_months = 0

            if (
                revised_doc
                and revised_doc != "-"
                and target_doc
                and target_doc != "-"
            ):

                try:

                    target = pd.to_datetime(
                        target_doc,
                        format="%m/%Y"
                    )

                    revised = pd.to_datetime(
                        revised_doc,
                        format="%m/%Y"
                    )

                    delay_months = (
                        (revised.year - target.year) * 12
                        + (revised.month - target.month)
                    )

                except Exception:

                    delay_months = 0

            if delay_months >= 12:
                risk = "CRITICAL"

            elif delay_months >= 6:
                risk = "HIGH"

            elif delay_months > 0:
                risk = "MEDIUM"

            else:
                risk = "LOW"

            results.append({
                "project_id": int(row["Sl. No"]),
                "project_name": row["Project Name"],
                "state": row["State"],
                "agency": row["Agency"],
                "target_doc": target_doc,
                "revised_doc": revised_doc,
                "delay_months": delay_months,
                "time_overrun_risk": risk
            })

        return jsonify({
            "status": "success",
            "total_projects": len(results),
            "projects": results
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# --------------------------------------------------
# ADVANCED PROJECT RISK SCORING
# --------------------------------------------------

@app.route("/risk-scores", methods=["GET"])
def risk_scores():

    try:
        cost_df = pd.read_csv(PROJECTS_FILE)
        prediction_df = pd.read_csv(PREDICTIONS_FILE)

        cost_df = cost_df.fillna("")
        prediction_df = prediction_df.fillna("")

        results = []

        for _, row in cost_df.iterrows():

            project_id = int(row["Sl. No"])

            original_cost = float(row["Original Cost"] or 0)
            revised_cost = float(row["Revised Cost"] or 0)
            expenditure = float(row["Cumulative Expenditure"] or 0)
            progress = float(row["Physical Progress"] or 0)

            # -------------------------------
            # COST RISK: 30 POINTS
            # -------------------------------

            if original_cost > 0:
                cost_overrun = (
                    (revised_cost - original_cost)
                    / original_cost
                ) * 100
            else:
                cost_overrun = 0

            cost_score = min(max(cost_overrun / 20 * 30, 0), 30)

            # -------------------------------
            # TIME RISK: 25 POINTS
            # -------------------------------

            target_doc = str(row["Target DoC"]).strip()
            revised_doc = str(row["Revised DoC"]).strip()

            delay_months = 0

            if (
                target_doc
                and revised_doc
                and target_doc != "-"
                and revised_doc != "-"
            ):
                try:
                    target = pd.to_datetime(
                        target_doc,
                        format="%m/%Y"
                    )

                    revised = pd.to_datetime(
                        revised_doc,
                        format="%m/%Y"
                    )

                    delay_months = (
                        (revised.year - target.year) * 12
                        + (revised.month - target.month)
                    )

                except Exception:
                    delay_months = 0

            time_score = min(max(delay_months / 12 * 25, 0), 25)

            # -------------------------------
            # PROGRESS RISK: 25 POINTS
            # -------------------------------

            progress_risk = max(0, 100 - progress)

            progress_score = (
                progress_risk / 100
            ) * 25

            # -------------------------------
            # EXPENDITURE RISK: 20 POINTS
            # -------------------------------

            if revised_cost > 0:
                expenditure_percent = (
                    expenditure / revised_cost
                ) * 100
            else:
                expenditure_percent = 0

            expenditure_score = min(
                max(expenditure_percent / 100 * 20, 0),
                20
            )

            # -------------------------------
            # FINAL RISK SCORE
            # -------------------------------

            risk_score = (
                cost_score
                + time_score
                + progress_score
                + expenditure_score
            )

            risk_score = round(
                min(max(risk_score, 0), 100),
                2
            )

            # -------------------------------
            # RISK LEVEL
            # -------------------------------

            if risk_score >= 75:
                risk_level = "CRITICAL"

            elif risk_score >= 50:
                risk_level = "HIGH"

            elif risk_score >= 25:
                risk_level = "MEDIUM"

            else:
                risk_level = "LOW"

            results.append({
                "project_id": project_id,
                "project_name": row["Project Name"],
                "state": row["State"],
                "agency": row["Agency"],
                "risk_score": risk_score,
                "risk_level": risk_level,
                "cost_overrun_percent": round(cost_overrun, 2),
                "delay_months": delay_months,
                "physical_progress": round(progress, 2),
                "expenditure_percent": round(
                    expenditure_percent,
                    2
                )
            })

        # Highest-risk projects first
        results.sort(
            key=lambda x: x["risk_score"],
            reverse=True
        )

        return jsonify({
            "status": "success",
            "total_projects": len(results),
            "projects": results
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# --------------------------------------------------
# EARLY WARNING SYSTEM
# --------------------------------------------------

@app.route("/early-warnings", methods=["GET"])
def early_warnings():

    try:
        df = pd.read_csv(PROJECTS_FILE)
        df = df.fillna("")

        warnings = []

        for _, row in df.iterrows():

            project_id = int(row["Sl. No"])
            project_name = row["Project Name"]
            state = row["State"]
            agency = row["Agency"]

            original_cost = float(row["Original Cost"] or 0)
            revised_cost = float(row["Revised Cost"] or 0)
            expenditure = float(row["Cumulative Expenditure"] or 0)
            progress = float(row["Physical Progress"] or 0)

            # -------------------------------
            # COST INDICATOR
            # -------------------------------

            if original_cost > 0:
                cost_overrun = (
                    (revised_cost - original_cost)
                    / original_cost
                ) * 100
            else:
                cost_overrun = 0

            # -------------------------------
            # TIME INDICATOR
            # -------------------------------

            target_doc = str(row["Target DoC"]).strip()
            revised_doc = str(row["Revised DoC"]).strip()

            delay_months = 0

            if (
                target_doc
                and revised_doc
                and target_doc != "-"
                and revised_doc != "-"
            ):
                try:
                    target = pd.to_datetime(
                        target_doc,
                        format="%m/%Y"
                    )

                    revised = pd.to_datetime(
                        revised_doc,
                        format="%m/%Y"
                    )

                    delay_months = (
                        (revised.year - target.year) * 12
                        + (revised.month - target.month)
                    )

                except Exception:
                    delay_months = 0

            # -------------------------------
            # EXPENDITURE INDICATOR
            # -------------------------------

            if revised_cost > 0:
                expenditure_percent = (
                    expenditure / revised_cost
                ) * 100
            else:
                expenditure_percent = 0

            # -------------------------------
            # DETECT WARNINGS
            # -------------------------------

            risk_factors = []
            severity_score = 0

            if cost_overrun >= 20:
                risk_factors.append(
                    "Severe cost overrun"
                )
                severity_score += 3

            elif cost_overrun >= 10:
                risk_factors.append(
                    "High cost escalation"
                )
                severity_score += 2

            elif cost_overrun > 0:
                risk_factors.append(
                    "Cost escalation detected"
                )
                severity_score += 1

            if delay_months >= 12:
                risk_factors.append(
                    "Severe schedule delay"
                )
                severity_score += 3

            elif delay_months >= 6:
                risk_factors.append(
                    "Significant schedule delay"
                )
                severity_score += 2

            elif delay_months > 0:
                risk_factors.append(
                    "Schedule delay detected"
                )
                severity_score += 1

            if progress < 30:
                risk_factors.append(
                    "Very low physical progress"
                )
                severity_score += 3

            elif progress < 50:
                risk_factors.append(
                    "Low physical progress"
                )
                severity_score += 2

            if expenditure_percent >= 90:
                risk_factors.append(
                    "Very high budget utilization"
                )
                severity_score += 3

            elif expenditure_percent >= 70:
                risk_factors.append(
                    "High budget utilization"
                )
                severity_score += 2

            # -------------------------------
            # ONLY CREATE ALERT WHEN NEEDED
            # -------------------------------

            if severity_score == 0:
                continue

            if severity_score >= 6:
                severity = "CRITICAL"

            elif severity_score >= 4:
                severity = "HIGH"

            elif severity_score >= 2:
                severity = "MEDIUM"

            else:
                severity = "LOW"

            # -------------------------------
            # RECOMMENDED ACTION
            # -------------------------------

            if severity == "CRITICAL":

                action = (
                    "Immediate intervention required. "
                    "Conduct project review and initiate "
                    "corrective measures."
                )

            elif severity == "HIGH":

                action = (
                    "Escalate for senior monitoring and "
                    "prepare a corrective action plan."
                )

            elif severity == "MEDIUM":

                action = (
                    "Increase monitoring frequency and "
                    "review identified risk factors."
                )

            else:

                action = (
                    "Continue regular monitoring."
                )

            warnings.append({
                "project_id": project_id,
                "project_name": project_name,
                "state": state,
                "agency": agency,
                "severity": severity,
                "severity_score": severity_score,
                "risk_factors": risk_factors,
                "cost_overrun_percent": round(
                    cost_overrun,
                    2
                ),
                "delay_months": delay_months,
                "physical_progress": round(
                    progress,
                    2
                ),
                "expenditure_percent": round(
                    expenditure_percent,
                    2
                ),
                "recommended_action": action
            })

        # Highest severity first
        severity_order = {
            "CRITICAL": 4,
            "HIGH": 3,
            "MEDIUM": 2,
            "LOW": 1
        }

        warnings.sort(
            key=lambda x: (
                severity_order[x["severity"]],
                x["severity_score"]
            ),
            reverse=True
        )

        return jsonify({
            "status": "success",
            "total_warnings": len(warnings),
            "critical": sum(
                1 for w in warnings
                if w["severity"] == "CRITICAL"
            ),
            "high": sum(
                1 for w in warnings
                if w["severity"] == "HIGH"
            ),
            "medium": sum(
                1 for w in warnings
                if w["severity"] == "MEDIUM"
            ),
            "low": sum(
                1 for w in warnings
                if w["severity"] == "LOW"
            ),
            "warnings": warnings
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# --------------------------------------------------
# RUN SERVER
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
def generate_recommendations(project):
    """
    Generates recommendations based on project risk indicators.
    """

    recommendations = []

    cost_escalation = project.get("cost_escalation", 0)
    schedule_delay = project.get("schedule_delay", 0)
    expenditure = project.get("expenditure", 0)
    physical_progress = project.get("physical_progress", 100)
    risk_level = project.get("risk_level", "Low")

    if cost_escalation > 20:
        recommendations.append(
            "Review the project budget and investigate the cause of cost escalation."
        )

    if schedule_delay > 30:
        recommendations.append(
            "Review the project schedule and prepare a revised completion plan."
        )

    if expenditure > 80 and physical_progress < 60:
        recommendations.append(
            "Investigate the expenditure-progress mismatch and control further spending."
        )

    if physical_progress < 50:
        recommendations.append(
            "Identify reasons for slow physical progress and prioritize delayed activities."
        )

    if risk_level == "Critical":
        recommendations.append(
            "Immediate management review is required for this project."
        )

    elif risk_level == "High":
        recommendations.append(
            "Project should be closely monitored and corrective action should be initiated."
        )

    if not recommendations:
        recommendations.append(
            "Continue regular monitoring. No immediate corrective action is required."
        )

    return recommendations


# Test data
project_data = {
    "project_id": 101,
    "risk_level": "Critical",
    "cost_escalation": 25,
    "schedule_delay": 40,
    "expenditure": 85,
    "physical_progress": 45
}

recommendations = generate_recommendations(project_data)

print("Recommendations:")

for recommendation in recommendations:
    print("-", recommendation)
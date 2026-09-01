def explain_risk(project):
    """
    Generates an explanation for the project's risk level
    based on the major risk indicators.
    """

    risk_level = project.get("risk_level", "Low")
    factors = []

    cost_escalation = project.get("cost_escalation", 0)
    schedule_delay = project.get("schedule_delay", 0)
    expenditure = project.get("expenditure", 0)
    physical_progress = project.get("physical_progress", 100)

    # Check cost escalation
    if cost_escalation > 20:
        factors.append("High cost escalation")

    # Check schedule delay
    if schedule_delay > 30:
        factors.append("Significant schedule delay")

    # Check expenditure
    if expenditure > 80:
        factors.append("High expenditure")

    # Check physical progress
    if physical_progress < 50:
        factors.append("Low physical progress")

    # Generate explanation
    if factors:
        explanation = (
            f"The project is classified as {risk_level} risk. "
            "The main contributing factors are: "
            + ", ".join(factors) + "."
        )
    else:
        explanation = (
            f"The project is classified as {risk_level} risk "
            "with no major risk indicators detected."
        )

    return {
        "risk_level": risk_level,
        "factors": factors,
        "explanation": explanation
    }


# Test data
project_data = {
    "project_id": 101,
    "risk_level": "Critical",
    "cost_escalation": 25,
    "schedule_delay": 40,
    "expenditure": 85,
    "physical_progress": 45
}

result = explain_risk(project_data)

print("Risk Level:", result["risk_level"])
print("Main Factors:")

for factor in result["factors"]:
    print("-", factor)

print("\nExplanation:")
print(result["explanation"])
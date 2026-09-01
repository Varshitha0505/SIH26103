def calculate_analytics(projects):
    """
    Calculates overall risk analytics for a list of projects.
    """

    total_projects = len(projects)

    low = 0
    medium = 0
    high = 0
    critical = 0

    for project in projects:
        risk_level = project.get("risk_level", "Low")

        if risk_level == "Low":
            low += 1
        elif risk_level == "Medium":
            medium += 1
        elif risk_level == "High":
            high += 1
        elif risk_level == "Critical":
            critical += 1

    return {
        "total_projects": total_projects,
        "low_risk": low,
        "medium_risk": medium,
        "high_risk": high,
        "critical_risk": critical
    }


# Test data
projects = [
    {"project_id": 101, "risk_level": "Critical"},
    {"project_id": 102, "risk_level": "High"},
    {"project_id": 103, "risk_level": "Medium"},
    {"project_id": 104, "risk_level": "Low"},
    {"project_id": 105, "risk_level": "Critical"}
]

analytics = calculate_analytics(projects)

print("PROJECT RISK ANALYTICS")
print("----------------------")
print("Total Projects:", analytics["total_projects"])
print("Low Risk:", analytics["low_risk"])
print("Medium Risk:", analytics["medium_risk"])
print("High Risk:", analytics["high_risk"])
print("Critical Risk:", analytics["critical_risk"])
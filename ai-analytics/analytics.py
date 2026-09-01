def calculate_analytics(projects):
    """
    Calculates overall risk analytics for multiple projects.
    """

    total_projects = len(projects)

    low_risk = 0
    medium_risk = 0
    high_risk = 0
    critical_risk = 0

    immediate_attention = []

    for project in projects:

        risk_level = project.get("risk_level", "LOW").upper()

        if risk_level == "LOW":
            low_risk += 1

        elif risk_level == "MEDIUM":
            medium_risk += 1

        elif risk_level == "HIGH":
            high_risk += 1
            immediate_attention.append(project)

        elif risk_level == "CRITICAL":
            critical_risk += 1
            immediate_attention.append(project)

    return {
        "total_projects": total_projects,
        "low_risk": low_risk,
        "medium_risk": medium_risk,
        "high_risk": high_risk,
        "critical_risk": critical_risk,
        "immediate_attention": immediate_attention
    }



import statistics


def calculate_analytics(projects):

    total_projects = len(projects)

    if total_projects == 0:
        return {
            "status": "success",
            "total_projects": 0
        }

    low_risk = 0
    medium_risk = 0
    high_risk = 0
    critical_risk = 0

    progress_values = []
    cost_values = []
    expenditure_values = []
    delay_values = []

    state_data = {}

    attention_projects = []

    for project in projects:

        risk = str(
            project.get(
                "risk_level",
                project.get("riskLevel", "LOW")
            )
        ).upper()

        progress = float(
            project.get(
                "physical_progress",
                project.get("Physical Progress", 0)
            ) or 0
        )

        cost = float(
            project.get(
                "cost_escalation",
                project.get("cost_escalation_percent", 0)
            ) or 0
        )

        expenditure = float(
            project.get(
                "expenditure_percent",
                0
            ) or 0
        )

        delay = float(
            project.get(
                "schedule_delay",
                project.get("delay_months", 0)
            ) or 0
        )

        state = project.get(
            "state",
            project.get("State", "Unknown")
        )

        # -----------------------------
        # RISK DISTRIBUTION
        # -----------------------------

        if risk == "LOW":
            low_risk += 1

        elif risk == "MEDIUM":
            medium_risk += 1

        elif risk == "HIGH":
            high_risk += 1
            attention_projects.append(project)

        elif risk == "CRITICAL":
            critical_risk += 1
            attention_projects.append(project)

        # -----------------------------
        # METRICS
        # -----------------------------

        progress_values.append(progress)
        cost_values.append(cost)
        expenditure_values.append(expenditure)
        delay_values.append(delay)

        # -----------------------------
        # STATE ANALYSIS
        # -----------------------------

        if state not in state_data:
            state_data[state] = {
                "projects": 0,
                "progress": [],
                "high_risk": 0,
                "critical_risk": 0
            }

        state_data[state]["projects"] += 1
        state_data[state]["progress"].append(progress)

        if risk == "HIGH":
            state_data[state]["high_risk"] += 1

        if risk == "CRITICAL":
            state_data[state]["critical_risk"] += 1

    # -----------------------------
    # AVERAGES
    # -----------------------------

    avg_progress = statistics.mean(
        progress_values
    )

    avg_cost_escalation = statistics.mean(
        cost_values
    )

    avg_expenditure = statistics.mean(
        expenditure_values
    )

    avg_delay = statistics.mean(
        delay_values
    )

    # -----------------------------
    # PORTFOLIO HEALTH SCORE
    # -----------------------------

    risk_penalty = (
        critical_risk * 4
        + high_risk * 2
        + medium_risk
    )

    risk_penalty_percent = (
        risk_penalty
        / (total_projects * 4)
    ) * 100

    health_score = (
        0.40 * avg_progress
        + 0.25 * max(0, 100 - avg_cost_escalation)
        + 0.20 * max(0, 100 - avg_expenditure)
        + 0.15 * max(0, 100 - risk_penalty_percent)
    )

    health_score = round(
        max(0, min(100, health_score)),
        2
    )

    # -----------------------------
    # STATE-WISE ANALYTICS
    # -----------------------------

    state_summary = []

    for state, data in state_data.items():

        state_summary.append({
            "state": state,
            "projects": data["projects"],
            "average_progress": round(
                statistics.mean(data["progress"]),
                2
            ),
            "high_risk": data["high_risk"],
            "critical_risk": data["critical_risk"]
        })

    state_summary.sort(
        key=lambda x: x["average_progress"],
        reverse=True
    )

    # -----------------------------
    # PROJECT PERFORMANCE
    # -----------------------------

    def get_score(project):

        progress = float(
            project.get(
                "physical_progress",
                project.get("Physical Progress", 0)
            ) or 0
        )

        cost = float(
            project.get(
                "cost_escalation",
                project.get("cost_escalation_percent", 0)
            ) or 0
        )

        return progress - cost

    sorted_projects = sorted(
        projects,
        key=get_score,
        reverse=True
    )

    top_projects = sorted_projects[:5]
    bottom_projects = sorted_projects[-5:]

    return {

        "status": "success",

        "total_projects": total_projects,

        "portfolio_health_score": health_score,

        "average_physical_progress": round(
            avg_progress,
            2
        ),

        "average_cost_escalation": round(
            avg_cost_escalation,
            2
        ),

        "average_budget_utilization": round(
            avg_expenditure,
            2
        ),

        "average_schedule_delay": round(
            avg_delay,
            2
        ),

        "risk_distribution": {
            "low": low_risk,
            "medium": medium_risk,
            "high": high_risk,
            "critical": critical_risk
        },

        "state_summary": state_summary,

        "top_performing_projects": top_projects,

        "bottom_performing_projects": bottom_projects,

        "immediate_attention": attention_projects
    }
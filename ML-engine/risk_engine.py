def calculate_risk(cost_escalation, schedule_delay,
                   expenditure, physical_progress):

    # Difference between money spent and actual work completed
    progress_gap = expenditure - physical_progress

    # -----------------------------
    # 1. COST ESCALATION RISK
    # -----------------------------
    if cost_escalation <= 5:
        cost_score = 10
    elif cost_escalation <= 10:
        cost_score = 30
    elif cost_escalation <= 20:
        cost_score = 70
    else:
        cost_score = 100

    # -----------------------------
    # 2. SCHEDULE DELAY RISK
    # -----------------------------
    if schedule_delay <= 10:
        delay_score = 10
    elif schedule_delay <= 20:
        delay_score = 40
    elif schedule_delay <= 30:
        delay_score = 70
    else:
        delay_score = 100

    # -----------------------------
    # 3. PROGRESS GAP RISK
    # -----------------------------
    if progress_gap <= 10:
        progress_score = 10
    elif progress_gap <= 20:
        progress_score = 40
    elif progress_gap <= 30:
        progress_score = 70
    else:
        progress_score = 100

    # -----------------------------
    # 4. EXPENDITURE RISK
    # -----------------------------
    if expenditure <= 50:
        expenditure_score = 20
    elif expenditure <= 70:
        expenditure_score = 40
    elif expenditure <= 85:
        expenditure_score = 70
    else:
        expenditure_score = 100

    # -----------------------------
    # 5. FINAL RISK SCORE
    # -----------------------------
    risk_score = (
        cost_score * 0.25 +
        delay_score * 0.25 +
        expenditure_score * 0.20 +
        progress_score * 0.30
    )

    # -----------------------------
    # 6. RISK CLASSIFICATION
    # -----------------------------
    if risk_score <= 25:
        risk_level = "LOW"
    elif risk_score <= 50:
        risk_level = "MEDIUM"
    elif risk_score <= 75:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return round(risk_score, 2), risk_level


# -----------------------------
# TEST PROJECT
# -----------------------------

score, level = calculate_risk(
    cost_escalation=18,
    schedule_delay=25,
    expenditure=80,
    physical_progress=55
)

print("Risk Score:", score)
print("Risk Level:", level)
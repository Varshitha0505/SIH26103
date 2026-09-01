/**
 * Unified project data normalization utility
 * Converts CSV/API data to consistent camelCase format
 */

export function normalizeProject(project) {
  if (!project || typeof project !== "object") {
    return {};
  }

  return {
    ...project,

    // Identifiers
    project_id: project.project_id || project["Sl. No"] || "",
    project_name:
      project.project_name ??
      project["Project Name"] ??
      project.ProjectName ??
      "Unnamed Project",
    project_code:
      project.project_code ??
      project["Project Code"] ??
      project.ProjectCode ??
      "",

    // Location & Agency
    state: project.state ?? project["State"] ?? "Unknown",
    agency: project.agency ?? project["Agency"] ?? "Agency unavailable",

    // Dates
    approval_date:
      project.approval_date ??
      project["Approval Date"] ??
      "",
    start_date:
      project.start_date ?? project["Start Date"] ?? "",
    target_doc:
      project.target_doc ?? project["Target DoC"] ?? "",
    revised_doc:
      project.revised_doc ??
      project["Revised DoC"] ??
      "",

    // Financial (in Crores)
    original_cost:
      Number(
        project.original_cost ??
          project["Original Cost"] ??
          0
      ) || 0,
    revised_cost:
      Number(
        project.revised_cost ??
          project["Revised Cost"] ??
          0
      ) || 0,
    cumulative_expenditure:
      Number(
        project.cumulative_expenditure ??
          project["Cumulative Expenditure"] ??
          0
      ) || 0,

    // Progress (in %)
    physical_progress:
      Number(
        project.physical_progress ??
          project["Physical Progress"] ??
          0
      ) || 0,

    // Risk Analysis
    risk_level: String(
      project.risk_level ??
        project["risk_level"] ??
        "LOW"
    ).toUpperCase(),
    confidence:
      Number(
        project.confidence ??
          project["confidence"] ??
          0
      ) || 0,
    risk_factors:
      project.risk_factors ??
      project["risk_factors"] ??
      "",

    // Derived Metrics (in %)
    cost_escalation:
      Number(
        project.cost_escalation ??
          project["cost_escalation"] ??
          0
      ) || 0,
    schedule_delay:
      Number(
        project.schedule_delay ??
          project["schedule_delay"] ??
          0
      ) || 0,
    expenditure:
      Number(
        project.expenditure ??
          project["expenditure"] ??
          0
      ) || 0,
    progress_gap:
      Number(
        project.progress_gap ??
          project["progress_gap"] ??
          0
      ) || 0,
  };
}

/**
 * Normalize multiple projects
 */
export function normalizeProjects(projects) {
  return (projects || []).map(normalizeProject);
}

/**
 * Format currency in Indian Rupees (Crores)
 */
export function formatCrore(value) {
  const num = Number(value) || 0;
  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(num)} Cr`;
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

/**
 * Format generic number with Indian locale
 */
export function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

/**
 * Calculate cost escalation percentage
 * Formula: ((Revised - Original) / Original) × 100
 */
export function calculateCostEscalation(
  originalCost,
  revisedCost
) {
  const original = Number(originalCost) || 0;
  if (original === 0) return 0;

  const revised = Number(revisedCost) || 0;
  return ((revised - original) / original) * 100;
}

/**
 * Get risk score (0-100) for a project
 * Based on multiple indicators
 */
export function calculateRiskScore(project) {
  const p = normalizeProject(project);

  let score = 50; // Start at neutral

  // Cost escalation (0-30 points)
  const costEsc = p.cost_escalation || 0;
  if (costEsc > 30) score += 30;
  else if (costEsc > 20) score += 25;
  else if (costEsc > 10) score += 15;
  else if (costEsc > 5) score += 8;

  // Schedule delay (0-30 points)
  const schedDelay = p.schedule_delay || 0;
  if (schedDelay > 50) score += 30;
  else if (schedDelay > 30) score += 25;
  else if (schedDelay > 15) score += 15;
  else if (schedDelay > 5) score += 8;

  // Physical progress gap (0-20 points)
  const progressGap =
    (p.progress_gap || 0) > 0 ? p.progress_gap : 0;
  if (progressGap > 40) score += 20;
  else if (progressGap > 25) score += 15;
  else if (progressGap > 10) score += 10;
  else if (progressGap > 0) score += 5;

  // Expenditure level (0-10 points)
  const expend = p.expenditure || 0;
  if (expend > 95) score += 10;
  else if (expend > 85) score += 8;
  else if (expend > 75) score += 5;

  // Physical progress (negative - good projects reduce score)
  const progress = p.physical_progress || 0;
  if (progress < 20) score += 10;
  else if (progress < 40) score += 5;
  else if (progress > 90) score -= 5;

  // Ensure score is 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get risk level based on risk score
 */
export function getRiskLevelFromScore(score) {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 41) return "MEDIUM";
  return "LOW";
}

/**
 * Get risk label based on risk level
 */
export function getRiskLabel(riskLevel) {
  const level = String(riskLevel || "LOW").toUpperCase();
  const labels = {
    LOW: "Low Risk",
    MEDIUM: "Medium Risk",
    HIGH: "High Risk",
    CRITICAL: "Critical",
  };
  return labels[level] || "Unknown";
}

/**
 * Get primary risk drivers for a project
 */
export function getRiskDrivers(project) {
  const p = normalizeProject(project);
  const drivers = [];

  // Cost escalation
  if (p.cost_escalation > 20) {
    drivers.push({
      name: "Cost Escalation",
      value: p.cost_escalation,
      severity: "CRITICAL",
      icon: "TrendingUp",
    });
  } else if (p.cost_escalation > 10) {
    drivers.push({
      name: "Cost Escalation",
      value: p.cost_escalation,
      severity: "HIGH",
      icon: "TrendingUp",
    });
  }

  // Schedule delay
  if (p.schedule_delay > 30) {
    drivers.push({
      name: "Schedule Delay",
      value: p.schedule_delay,
      severity: "CRITICAL",
      icon: "Clock",
    });
  } else if (p.schedule_delay > 15) {
    drivers.push({
      name: "Schedule Delay",
      value: p.schedule_delay,
      severity: "HIGH",
      icon: "Clock",
    });
  }

  // Progress gap
  if (p.progress_gap > 30) {
    drivers.push({
      name: "Expenditure-Progress Gap",
      value: p.progress_gap,
      severity: "HIGH",
      icon: "AlertTriangle",
    });
  } else if (p.progress_gap > 15) {
    drivers.push({
      name: "Expenditure-Progress Gap",
      value: p.progress_gap,
      severity: "MEDIUM",
      icon: "AlertTriangle",
    });
  }

  // Low physical progress
  if (p.physical_progress < 30) {
    drivers.push({
      name: "Low Physical Progress",
      value: p.physical_progress,
      severity: "HIGH",
      icon: "Gauge",
    });
  }

  // High expenditure
  if (p.expenditure > 90) {
    drivers.push({
      name: "Very High Expenditure",
      value: p.expenditure,
      severity: "MEDIUM",
      icon: "DollarSign",
    });
  }

  return drivers.slice(0, 4); // Return top 4 drivers
}

/**
 * Generate AI recommendations based on project indicators
 */
export function generateRecommendations(project) {
  const p = normalizeProject(project);
  const recommendations = [];
  let priority = "ROUTINE";

  const drivers = getRiskDrivers(p);
  if (drivers.length === 0) {
    priority = "ROUTINE";
    recommendations.push(
      "Continue routine monitoring. Project is performing within acceptable parameters."
    );
  } else {
    priority = "IMMEDIATE";

    if (p.cost_escalation > 20) {
      recommendations.push(
        "Review revised cost estimates and investigate root causes of escalation"
      );
      recommendations.push(
        "Conduct detailed financial audit and implement cost control measures"
      );
    } else if (p.cost_escalation > 10) {
      recommendations.push(
        "Monitor cost trends closely and request revised budget justification"
      );
    }

    if (p.schedule_delay > 30) {
      recommendations.push(
        "Prepare and review detailed schedule recovery plan"
      );
      recommendations.push(
        "Increase monitoring frequency to weekly/bi-weekly"
      );
    } else if (p.schedule_delay > 15) {
      recommendations.push(
        "Review schedule and identify critical path delays"
      );
    }

    if (
      p.expenditure > 80 &&
      p.physical_progress < 60
    ) {
      recommendations.push(
        "Investigate expenditure-to-progress mismatch and control further spending"
      );
      recommendations.push(
        "Conduct value-for-money audit"
      );
    }

    if (p.physical_progress < 30) {
      recommendations.push(
        "Conduct immediate site inspection and implement recovery measures"
      );
      recommendations.push(
        "Escalate to senior management for intervention decision"
      );
    }

    if (p.risk_level === "CRITICAL") {
      recommendations.push(
        "Initiate management review meeting immediately"
      );
      priority = "IMMEDIATE";
    }
  }

  return {
    priority,
    count: recommendations.length,
    recommendations: recommendations.slice(0, 5),
  };
}

/**
 * Calculate portfolio statistics
 */
export function calculatePortfolioStats(projects) {
  const normalized = normalizeProjects(projects);
  const total = normalized.length;

  const stats = {
    total,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
    avgProgress: 0,
    avgCostEscalation: 0,
    avgScheduleDelay: 0,
    avgExpenditureRate: 0,
    totalOriginalCost: 0,
    totalRevisedCost: 0,
    totalExpenditure: 0,
  };

  if (total === 0) return stats;

  normalized.forEach((p) => {
    const level = p.risk_level;
    if (level === "LOW") stats.low++;
    else if (level === "MEDIUM") stats.medium++;
    else if (level === "HIGH") stats.high++;
    else if (level === "CRITICAL") stats.critical++;

    stats.avgProgress += p.physical_progress;
    stats.avgCostEscalation += p.cost_escalation;
    stats.avgScheduleDelay += p.schedule_delay;
    stats.avgExpenditureRate += p.expenditure;
    stats.totalOriginalCost += p.original_cost;
    stats.totalRevisedCost += p.revised_cost;
    stats.totalExpenditure +=
      p.cumulative_expenditure;
  });

  stats.avgProgress = stats.avgProgress / total;
  stats.avgCostEscalation =
    stats.avgCostEscalation / total;
  stats.avgScheduleDelay =
    stats.avgScheduleDelay / total;
  stats.avgExpenditureRate =
    stats.avgExpenditureRate / total;
  stats.budgetUtilization =
    stats.totalRevisedCost > 0
      ? (stats.totalExpenditure /
          stats.totalRevisedCost) *
        100
      : 0;

  return stats;
}

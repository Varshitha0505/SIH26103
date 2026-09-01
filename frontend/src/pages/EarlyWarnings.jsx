import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  normalizeProjects,
  getRiskDrivers,
  generateRecommendations,
} from "../utils/projectUtils";

const API_URL = "http://127.0.0.1:5000";

const severityConfig = {
  CRITICAL: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
  },
  HIGH: {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-800",
  },
  MEDIUM: {
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800",
  },
  LOW: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
  },
};

export default function EarlyWarnings() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      const normalized = normalizeProjects(data.projects || []);
      setProjects(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Generate alerts for each project
  const alerts = useMemo(() => {
    const allAlerts = [];

    projects.forEach((project) => {
      const drivers = getRiskDrivers(project);
      const recs = generateRecommendations(project);

      drivers.forEach((driver) => {
        const alert = {
          id: `${project.project_id}-${driver.name}`,
          project_id: project.project_id,
          project_name: project.project_name,
          project_code: project.project_code,
          state: project.state,
          category: driver.name,
          severity: driver.severity,
          priority:
            driver.severity === "CRITICAL" ||
            driver.severity === "HIGH"
              ? "IMMEDIATE"
              : "ROUTINE",
          message: `${driver.name}: ${driver.value}`,
          driver,
          recommendations: recs.slice(0, 3),
          risk_level: project.risk_level,
          timestamp: new Date().toISOString(),
        };
        allAlerts.push(alert);
      });
    });

    // Sort by severity and timestamp
    return allAlerts.sort((a, b) => {
      const severityOrder = {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };
      return (
        severityOrder[a.severity] -
          severityOrder[b.severity] ||
        new Date(b.timestamp) -
          new Date(a.timestamp)
      );
    });
  }, [projects]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const priorityMatch =
        selectedPriority === "all" ||
        alert.priority === selectedPriority;
      const categoryMatch =
        selectedCategory === "all" ||
        alert.category === selectedCategory;
      return priorityMatch && categoryMatch;
    });
  }, [alerts, selectedPriority, selectedCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(alerts.map((a) => a.category)));
  }, [alerts]);

  const priorityCount = useMemo(() => {
    return {
      all: alerts.length,
      IMMEDIATE: alerts.filter(
        (a) => a.priority === "IMMEDIATE"
      ).length,
      ROUTINE: alerts.filter(
        (a) => a.priority === "ROUTINE"
      ).length,
    };
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-600 p-2.5 text-white">
              <Bell size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                Early Warnings Center
              </h1>
              <p className="text-xs text-slate-500">
                {alerts.length} active alerts
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <button
              onClick={fetchProjects}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Alert Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Total Alerts
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {alerts.length}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Across {projects.length} projects
            </p>
          </div>

          <div className="rounded-xl border bg-red-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Immediate Action
                </p>
                <p className="mt-3 text-3xl font-bold text-red-700">
                  {priorityCount.IMMEDIATE}
                </p>
              </div>
              <Zap size={32} className="text-red-400" />
            </div>
          </div>

          <div className="rounded-xl border bg-blue-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Routine Follow-up
                </p>
                <p className="mt-3 text-3xl font-bold text-blue-700">
                  {priorityCount.ROUTINE}
                </p>
              </div>
              <AlertCircle
                size={32}
                className="text-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPriority("all")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedPriority === "all"
                  ? "bg-blue-600 text-white"
                  : "border bg-white hover:bg-slate-50"
              }`}
            >
              All ({priorityCount.all})
            </button>
            <button
              onClick={() => setSelectedPriority("IMMEDIATE")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedPriority === "IMMEDIATE"
                  ? "bg-red-600 text-white"
                  : "border bg-white hover:bg-slate-50"
              }`}
            >
              Immediate ({priorityCount.IMMEDIATE})
            </button>
            <button
              onClick={() => setSelectedPriority("ROUTINE")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedPriority === "ROUTINE"
                  ? "bg-blue-600 text-white"
                  : "border bg-white hover:bg-slate-50"
              }`}
            >
              Routine ({priorityCount.ROUTINE})
            </button>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <AlertCircle
                size={40}
                className="mx-auto text-slate-400"
              />
              <p className="mt-3 text-slate-600">
                No alerts match your filters
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function AlertCard({ alert }) {
  const config = severityConfig[alert.severity];

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg} p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`rounded-lg px-2 py-1 text-xs font-bold ${config.badge}`}>
              {alert.priority === "IMMEDIATE"
                ? "🔴 IMMEDIATE"
                : "🟡 ROUTINE"}
            </span>
            <span
              className={`text-xs font-bold uppercase ${config.color}`}
            >
              {alert.category}
            </span>
          </div>

          <div className="mt-3">
            <h4 className={`font-bold ${config.color}`}>
              {alert.project_name}
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              {alert.message}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
              Code: {alert.project_code}
            </span>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
              State: {alert.state}
            </span>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
              Risk: {alert.risk_level}
            </span>
          </div>

          {/* Recommendations */}
          {alert.recommendations && alert.recommendations.length > 0 && (
            <div className="mt-3 rounded-lg bg-white/50 p-3">
              <p className="text-xs font-semibold text-slate-700">
                Recommended Actions:
              </p>
              <ul className="mt-2 space-y-1">
                {alert.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-600 flex gap-2"
                  >
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link
          to={`/projects/${alert.project_code}`}
          className="whitespace-nowrap rounded-lg bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
        >
          View →
        </Link>
      </div>
    </div>
  );
}

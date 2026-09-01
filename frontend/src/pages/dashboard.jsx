import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  IndianRupee,
  LayoutDashboard,
  Menu,
  PieChart as PieChartIcon,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  normalizeProject,
  normalizeProjects,
  formatCrore,
  formatNumber,
  calculateRiskScore,
  generateRecommendations,
} from "../utils/projectUtils";

const API_URL = "http://127.0.0.1:5000";

const riskColors = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

/* =========================================================
   HELPERS
========================================================= */

function getRiskScore(projects) {
  if (!projects.length) return 0;

  const scoreMap = {
    LOW: 100,
    MEDIUM: 70,
    HIGH: 40,
    CRITICAL: 10,
  };

  const total = projects.reduce(
    (sum, project) =>
      sum + (scoreMap[project.risk_level] || 0),
    0
  );

  return Math.round(total / projects.length);
}

/* =========================================================
   RISK BADGE
========================================================= */

function RiskBadge({ risk }) {
  const level = String(risk || "LOW").toUpperCase();

  const styles = {
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    CRITICAL: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
        styles[level] || styles.LOW
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor:
            riskColors[level] || riskColors.LOW,
        }}
      />

      {level}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconClass,
  valueClass = "text-slate-900",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-extrabold ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  /* =======================================================
     FETCH PROJECTS
  ======================================================= */

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/projects`);

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        const normalizedProjects = (
          data.projects || []
        ).map(normalizeProject);

        setProjects(normalizedProjects);

        setLastUpdated(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch projects:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* =======================================================
     PORTFOLIO STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total = projects.length;

    const low = projects.filter(
      (p) => p.risk_level === "LOW"
    ).length;

    const medium = projects.filter(
      (p) => p.risk_level === "MEDIUM"
    ).length;

    const high = projects.filter(
      (p) => p.risk_level === "HIGH"
    ).length;

    const critical = projects.filter(
      (p) => p.risk_level === "CRITICAL"
    ).length;

    const avgProgress =
      total > 0
        ? projects.reduce(
            (sum, p) =>
              sum + p.physical_progress,
            0
          ) / total
        : 0;

    const totalOriginalCost =
      projects.reduce(
        (sum, p) =>
          sum + p.original_cost,
        0
      );

    const totalRevisedCost =
      projects.reduce(
        (sum, p) =>
          sum + p.revised_cost,
        0
      );

    const totalExpenditure =
      projects.reduce(
        (sum, p) =>
          sum + p.cumulative_expenditure,
        0
      );

    const budgetUtilization =
      totalRevisedCost > 0
        ? (totalExpenditure /
            totalRevisedCost) *
          100
        : 0;

    return {
      total,
      low,
      medium,
      high,
      critical,
      avgProgress,
      totalOriginalCost,
      totalRevisedCost,
      totalExpenditure,
      budgetUtilization,
    };
  }, [projects]);

  /* =======================================================
     HEALTH SCORE
  ======================================================= */

  const healthScore = getRiskScore(projects);

  /* =======================================================
     RISK DATA
  ======================================================= */

  const riskData = [
    {
      name: "Low",
      value: stats.low,
      level: "LOW",
    },
    {
      name: "Medium",
      value: stats.medium,
      level: "MEDIUM",
    },
    {
      name: "High",
      value: stats.high,
      level: "HIGH",
    },
    {
      name: "Critical",
      value: stats.critical,
      level: "CRITICAL",
    },
  ];

  /* =======================================================
     STATE DATA
  ======================================================= */

  const stateData = useMemo(() => {
    const stateMap = {};

    projects.forEach((project) => {
      const state =
        project.state || "Unknown";

      if (!stateMap[state]) {
        stateMap[state] = {
          state,
          projects: 0,
          progress: 0,
        };
      }

      stateMap[state].projects += 1;

      stateMap[state].progress +=
        project.physical_progress;
    });

    return Object.values(stateMap)
      .map((item) => ({
        ...item,
        progress:
          item.progress /
          item.projects,
      }))
      .sort(
        (a, b) =>
          b.projects - a.projects
      )
      .slice(0, 8);
  }, [projects]);

  /* =======================================================
     PRIORITY PROJECTS
     
     IMPORTANT:
     This now uses normalized fields.
     No more "Unnamed Project".
  ======================================================= */

  const criticalProjects = useMemo(() => {
    return [...projects]
      .filter((project) =>
        ["CRITICAL", "HIGH"].includes(
          project.risk_level
        )
      )
      .sort((a, b) => {
        const order = {
          CRITICAL: 0,
          HIGH: 1,
        };

        return (
          (order[a.risk_level] ?? 9) -
          (order[b.risk_level] ?? 9)
        );
      })
      .slice(0, 6);
  }, [projects]);

  /* =======================================================
     RISK PERCENTAGE
  ======================================================= */

  const riskPercentage =
    stats.total > 0
      ? ((stats.high +
          stats.critical) /
          stats.total) *
        100
      : 0;

  const portfolioStatus =
    stats.critical > 0
      ? "Requires intervention"
      : stats.high > 0
      ? "Needs monitoring"
      : "Portfolio stable";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* LOGO */}

        <div className="flex h-[76px] items-center justify-between border-b border-slate-200 px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Activity size={21} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-900">
                ProjectIQ
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Monitoring Platform
              </p>
            </div>

          </div>

          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={18} />
          </button>

        </div>

        {/* NAVIGATION */}

        <div className="px-4 pt-7">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">

            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-sm font-bold text-blue-700"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              to="/projects"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Building2 size={18} />
              Projects
            </Link>

            <Link
              to="/analytics"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <BarChart3 size={18} />
              Analytics
            </Link>

            <Link
              to="/early-warnings"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Bell size={18} />
              Early Warnings

              {stats.critical > 0 && (
                <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  {stats.critical}
                </span>
              )}
            </Link>

            <Link
              to="/risk-matrix"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <PieChartIcon size={18} />
              Risk Matrix
            </Link>

            <Link
              to="/benchmarking"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <TrendingUp size={18} />
              Benchmarking
            </Link>

            <Link
              to="/ai-assistant"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <BrainCircuit size={18} />
              AI Assistant
            </Link>

            <Link
              to="/methodology"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <BookOpen size={18} />
              Methodology
            </Link>

          </nav>
        </div>

        {/* AI BOX */}

        <div className="mt-auto p-4">

          <div className="rounded-2xl bg-slate-950 p-4 text-white">

            <div className="mb-3 flex items-center gap-2">
              <BrainCircuit
                size={18}
                className="text-blue-400"
              />

              <span className="text-xs font-bold">
                AI Intelligence
              </span>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              Risk predictions are generated from
              project performance, expenditure and
              schedule indicators.
            </p>

            <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-emerald-400">

              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              MODEL ONLINE

            </div>

          </div>

        </div>

      </aside>

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div className="lg:pl-[250px]">

        {/* TOP BAR */}

        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-lg font-extrabold text-slate-900">
                Command Center
              </p>

              <p className="hidden text-xs text-slate-400 sm:block">
                Portfolio intelligence & risk monitoring
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 md:flex">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              System operational

            </div>

            <button
              onClick={fetchProjects}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white sm:flex">
              PM
            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">

          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl lg:p-9">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="absolute bottom-[-100px] left-[35%] h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_330px] lg:items-center">

              <div>

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">

                  <Zap size={14} />

                  AI PROJECT INTELLIGENCE

                </div>

                <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">

                  Know the risk.

                  <br />

                  <span className="text-blue-400">
                    Act before the delay.
                  </span>

                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                  A unified view of project health,
                  budget utilization, physical progress
                  and AI-generated risk signals across
                  your entire portfolio.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-blue-50"
                  >
                    Explore projects
                    <ArrowRight size={16} />
                  </Link>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300">

                    <Clock3 size={15} />

                    Updated {lastUpdated || "—"}

                  </div>

                </div>

              </div>

              {/* HEALTH SCORE */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur">

                <div className="flex items-center justify-between">

                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Portfolio health
                  </span>

                  <ShieldCheck
                    size={20}
                    className="text-emerald-400"
                  />

                </div>

                <div className="mt-5 flex items-end gap-3">

                  <span className="text-6xl font-black">
                    {healthScore}
                  </span>

                  <span className="mb-2 text-sm text-slate-400">
                    / 100
                  </span>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${Math.max(
                        healthScore,
                        3
                      )}%`,
                    }}
                  />

                </div>

                <div className="mt-4 flex items-center justify-between">

                  <span className="text-xs font-semibold text-slate-400">
                    {portfolioStatus}
                  </span>

                  <span className="text-xs font-bold text-emerald-400">
                    {Math.max(
                      0,
                      100 -
                        Math.round(
                          riskPercentage
                        )
                    )}
                    % stable
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

            <StatCard
              icon={Building2}
              label="Total Portfolio"
              value={formatNumber(stats.total)}
              subtitle="Projects monitored"
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              icon={CheckCircle2}
              label="Low Risk"
              value={formatNumber(stats.low)}
              subtitle="Projects currently stable"
              iconClass="bg-emerald-50 text-emerald-600"
              valueClass="text-emerald-600"
            />

            <StatCard
              icon={CircleAlert}
              label="Medium Risk"
              value={formatNumber(stats.medium)}
              subtitle="Requires observation"
              iconClass="bg-amber-50 text-amber-600"
              valueClass="text-amber-600"
            />

            <StatCard
              icon={AlertTriangle}
              label="High Risk"
              value={formatNumber(stats.high)}
              subtitle="Requires monitoring"
              iconClass="bg-orange-50 text-orange-600"
              valueClass="text-orange-600"
            />

            <StatCard
              icon={ShieldCheck}
              label="Critical"
              value={formatNumber(stats.critical)}
              subtitle="Immediate intervention"
              iconClass="bg-red-50 text-red-600"
              valueClass="text-red-600"
            />

          </section>

          {/* =================================================
              AI + RISK
          ================================================= */}

          <section className="mt-7 grid gap-6 xl:grid-cols-[1.55fr_1fr]">

            {/* AI INTELLIGENCE */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
                      <BrainCircuit size={18} />
                    </div>

                    <h2 className="font-extrabold text-slate-900">
                      AI Risk Intelligence
                    </h2>

                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Automated analysis of your project portfolio
                  </p>

                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-600">
                  MODEL ACTIVE
                </span>

              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-3">

                {/* PROGRESS */}

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold text-slate-400">
                    Average progress
                  </p>

                  <div className="mt-2 flex items-end gap-2">

                    <span className="text-3xl font-black">
                      {stats.avgProgress.toFixed(1)}%
                    </span>

                    <TrendingUp
                      size={17}
                      className="mb-1 text-emerald-500"
                    />

                  </div>

                  <div className="mt-4 h-1.5 rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          stats.avgProgress,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                {/* ATTENTION */}

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold text-slate-400">
                    Immediate attention
                  </p>

                  <div className="mt-2 flex items-end gap-2">

                    <span className="text-3xl font-black text-red-600">
                      {stats.high +
                        stats.critical}
                    </span>

                    <AlertTriangle
                      size={17}
                      className="mb-1 text-red-500"
                    />

                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    High + critical projects
                  </p>

                </div>

                {/* BUDGET */}

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold text-slate-400">
                    Budget utilization
                  </p>

                  <div className="mt-2 flex items-end gap-2">

                    <span className="text-3xl font-black">
                      {stats.budgetUtilization.toFixed(
                        1
                      )}
                      %
                    </span>

                    <IndianRupee
                      size={17}
                      className="mb-1 text-blue-500"
                    />

                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Across revised budgets
                  </p>

                </div>

              </div>

              {/* AI ASSESSMENT */}

              <div className="mx-6 mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">

                <div className="flex gap-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <BrainCircuit size={17} />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-900">
                      AI assessment
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">

                      {stats.critical > 0
                        ? `${stats.critical} critical projects require immediate intervention. Review their risk factors and corrective actions before the next monitoring cycle.`
                        : stats.high > 0
                        ? `${stats.high} high-risk projects have been identified. Monitor their progress and expenditure closely.`
                        : "The current portfolio shows no critical or high-risk projects. Continue routine monitoring."}

                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* RISK DISTRIBUTION */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-extrabold text-slate-900">
                    Risk Distribution
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Current portfolio risk profile
                  </p>

                </div>

                <PieChartIcon
                  size={20}
                  className="text-slate-400"
                />

              </div>

              <div className="relative mt-3 h-[235px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={riskData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={92}
                      paddingAngle={3}
                      stroke="none"
                    >

                      {riskData.map(
                        (entry) => (
                          <Cell
                            key={
                              entry.level
                            }
                            fill={
                              riskColors[
                                entry.level
                              ]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        `${value} projects`,
                        "Count",
                      ]}
                    />

                  </PieChart>

                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                  <span className="text-3xl font-black text-slate-900">
                    {stats.total}
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Projects
                  </span>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                {riskData.map(
                  (item) => (
                    <div
                      key={item.level}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
                    >

                      <div className="flex items-center gap-2">

                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              riskColors[
                                item.level
                              ],
                          }}
                        />

                        <span className="text-xs font-semibold text-slate-600">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-sm font-extrabold text-slate-900">
                        {item.value}
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>

          </section>

          {/* =================================================
              BUDGET + STATE
          ================================================= */}

          <section className="mt-7 grid gap-6 xl:grid-cols-2">

            {/* BUDGET */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="font-extrabold text-slate-900">
                    Portfolio Budget
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Cost and expenditure overview
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <IndianRupee size={18} />
                </div>

              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">

                <div>

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Original
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {formatCrore(
                      stats.totalOriginalCost
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Revised
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {formatCrore(
                      stats.totalRevisedCost
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Spent
                  </p>

                  <p className="mt-1 text-lg font-black text-blue-600">
                    {formatCrore(
                      stats.totalExpenditure
                    )}
                  </p>

                </div>

              </div>

              <div className="mt-7">

                <div className="mb-2 flex justify-between text-xs">

                  <span className="font-semibold text-slate-500">
                    Expenditure utilization
                  </span>

                  <span className="font-bold text-slate-900">
                    {stats.budgetUtilization.toFixed(
                      1
                    )}
                    %
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          stats.budgetUtilization,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* STATE */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="font-extrabold text-slate-900">
                    State-wise Portfolio
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Projects and average physical progress
                  </p>

                </div>

                <Target
                  size={20}
                  className="text-slate-400"
                />

              </div>

              <div className="mt-5 h-[245px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={stateData}
                    layout="vertical"
                    margin={{
                      top: 0,
                      right: 15,
                      left: 5,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      type="category"
                      dataKey="state"
                      width={85}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${Number(
                          value
                        ).toFixed(1)}%`,
                        "Progress",
                      ]}
                    />

                    <Bar
                      dataKey="progress"
                      fill="#2563eb"
                      radius={[
                        0,
                        5,
                        5,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

          </section>

          {/* =================================================
              PRIORITY INTERVENTION QUEUE
          ================================================= */}

          <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">

              <div>

                <div className="flex items-center gap-2">

                  <div className="rounded-lg bg-red-100 p-2 text-red-600">
                    <AlertTriangle size={18} />
                  </div>

                  <h2 className="font-extrabold text-slate-900">
                    Priority Intervention Queue
                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Projects requiring the closest attention
                </p>

              </div>

              <Link
                to="/projects"
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View all projects
                <ChevronRight size={15} />
              </Link>

            </div>

            {/* NO PROJECTS */}

            {criticalProjects.length === 0 ? (

              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

                <div className="rounded-full bg-emerald-50 p-4 text-emerald-600">
                  <CheckCircle2 size={28} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  No immediate interventions
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  All monitored projects are currently below
                  the high-risk threshold.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {criticalProjects.map(
                  (project, index) => {

                    const projectId =
                      project.project_code ||
                      project.ProjectCode ||
                      project["Project Code"] ||
                      index;

                    const progress =
                      Math.min(
                        Math.max(
                          Number(
                            project.physical_progress
                          ) || 0,
                          0
                        ),
                        100
                      );

                    return (

                      <Link
                        key={`${projectId}-${index}`}
                        to={`/projects/${projectId}`}
                        state={{
                          project,
                        }}
                        className="group flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50 md:flex-row md:items-center"
                      >

                        {/* PROJECT INFO */}

                        <div className="flex min-w-0 flex-1 items-center gap-4">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">
                            #{index + 1}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600">

                              {project.project_name}

                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">

                              {project.state}

                              {" • "}

                              {project.agency}

                            </p>

                          </div>

                        </div>

                        {/* PROGRESS + RISK */}

                        <div className="flex items-center gap-6">

                          <div className="hidden w-28 sm:block">

                            <div className="mb-1 flex justify-between text-[10px]">

                              <span className="font-semibold text-slate-400">
                                Progress
                              </span>

                              <span className="font-bold text-slate-600">
                                {progress.toFixed(1)}%
                              </span>

                            </div>

                            <div className="h-1.5 rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />

                            </div>

                          </div>

                          <RiskBadge
                            risk={
                              project.risk_level
                            }
                          />

                          <ArrowRight
                            size={17}
                            className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                          />

                        </div>

                      </Link>

                    );
                  }
                )}

              </div>

            )}

          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-6 flex flex-col justify-between gap-3 pb-5 text-[11px] text-slate-400 sm:flex-row sm:items-center">

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              ML risk engine connected

            </div>

            <div className="flex items-center gap-4">

              <span>
                Flask backend
              </span>

              <span>•</span>

              <span>
                AI Analytics Enabled
              </span>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
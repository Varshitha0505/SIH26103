import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Layout,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  normalizeProjects,
  calculatePortfolioStats,
} from "../utils/projectUtils";

const API_URL = "http://127.0.0.1:5000";

const riskColors = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      const normalized = normalizeProjects(
        data.projects || []
      );
      setProjects(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const stats = useMemo(() => {
    return calculatePortfolioStats(projects);
  }, [projects]);

  // 1. Cost Escalation Distribution
  const costEscalationData = useMemo(() => {
    const bins = [
      { range: "0-5%", min: 0, max: 5, count: 0 },
      { range: "5-10%", min: 5, max: 10, count: 0 },
      { range: "10-20%", min: 10, max: 20, count: 0 },
      { range: "20-30%", min: 20, max: 30, count: 0 },
      { range: ">30%", min: 30, max: 999, count: 0 },
    ];

    projects.forEach((p) => {
      const cost = p.cost_escalation || 0;
      bins.forEach((bin) => {
        if (cost >= bin.min && cost < bin.max) {
          bin.count++;
        }
      });
    });

    return bins;
  }, [projects]);

  // 2. Schedule Delay Distribution
  const scheduleDelayData = useMemo(() => {
    const bins = [
      { range: "0-5 mo", min: 0, max: 5, count: 0 },
      { range: "5-15 mo", min: 5, max: 15, count: 0 },
      { range: "15-30 mo", min: 15, max: 30, count: 0 },
      { range: ">30 mo", min: 30, max: 999, count: 0 },
    ];

    projects.forEach((p) => {
      const delay = p.schedule_delay || 0;
      bins.forEach((bin) => {
        if (delay >= bin.min && delay < bin.max) {
          bin.count++;
        }
      });
    });

    return bins;
  }, [projects]);

  // 3. Physical Progress Distribution
  const progressData = useMemo(() => {
    const bins = [
      { range: "0-20%", min: 0, max: 20, count: 0 },
      { range: "20-40%", min: 20, max: 40, count: 0 },
      { range: "40-60%", min: 40, max: 60, count: 0 },
      { range: "60-80%", min: 60, max: 80, count: 0 },
      { range: "80-100%", min: 80, max: 100, count: 0 },
    ];

    projects.forEach((p) => {
      const progress = p.physical_progress || 0;
      bins.forEach((bin) => {
        if (progress >= bin.min && progress <= bin.max) {
          bin.count++;
        }
      });
    });

    return bins;
  }, [projects]);

  // 4. Budget Utilization by Risk Level
  const budgetByRiskData = useMemo(() => {
    const data = {
      LOW: { count: 0, total: 0 },
      MEDIUM: { count: 0, total: 0 },
      HIGH: { count: 0, total: 0 },
      CRITICAL: { count: 0, total: 0 },
    };

    projects.forEach((p) => {
      const level = p.risk_level;
      if (data[level]) {
        data[level].count++;
        data[level].total +=
          p.cumulative_expenditure || 0;
      }
    });

    return Object.entries(data).map(
      ([level, { count, total }]) => ({
        name: level,
        projects: count,
        expenditure: total.toFixed(2),
      })
    );
  }, [projects]);

  // 5. Risk vs Progress Scatter
  const riskProgressData = useMemo(() => {
    return projects
      .slice(0, 50)
      .map((p) => ({
        progress: p.physical_progress,
        cost_escalation: p.cost_escalation,
        schedule_delay: p.schedule_delay,
        risk_level: p.risk_level,
        project_name: p.project_name,
      }));
  }, [projects]);

  // 6. Cost Escalation vs Progress
  const costProgressData = useMemo(() => {
    return projects
      .filter((p) => p.cost_escalation > 0)
      .slice(0, 30)
      .map((p) => ({
        progress: p.physical_progress,
        cost_escalation: p.cost_escalation,
        expenditure: p.expenditure,
        project_name: p.project_name,
      }));
  }, [projects]);

  // 7. Expenditure vs Physical Progress
  const expenditureProgressData = useMemo(() => {
    return projects.slice(0, 40).map((p) => ({
      physical_progress: p.physical_progress,
      expenditure: p.expenditure,
      project_name: p.project_name,
      risk_level: p.risk_level,
    }));
  }, [projects]);

  // 8. Risk Trend by State
  const stateRiskData = useMemo(() => {
    const stateMap = {};

    projects.forEach((p) => {
      const state = p.state || "Unknown";
      if (!stateMap[state]) {
        stateMap[state] = {
          state,
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0,
          CRITICAL: 0,
        };
      }
      const level = p.risk_level || "LOW";
      stateMap[state][level]++;
    });

    return Object.values(stateMap)
      .sort(
        (a, b) =>
          b.CRITICAL +
          b.HIGH -
          (a.CRITICAL + a.HIGH)
      )
      .slice(0, 10);
  }, [projects]);

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
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <BarChart3 size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                Analytics Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Portfolio performance & risk analysis
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
        {/* Summary Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Projects"
            value={stats.total}
            trend="+12"
          />
          <StatCard title="Avg Progress" value={`${stats.avgProgress.toFixed(1)}%`} />
          <StatCard
            title="Budget Utilization"
            value={`${stats.budgetUtilization.toFixed(1)}%`}
          />
          <StatCard
            title="Avg Cost Escalation"
            value={`${stats.avgCostEscalation.toFixed(1)}%`}
          />
          <StatCard
            title="Avg Schedule Delay"
            value={`${stats.avgScheduleDelay.toFixed(1)} mo`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cost Escalation Distribution */}
          <ChartCard
            title="Cost Escalation Distribution"
            subtitle="Distribution of projects by cost increase %"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costEscalationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Schedule Delay Distribution */}
          <ChartCard
            title="Schedule Delay Distribution"
            subtitle="Distribution of projects by delay in months"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scheduleDelayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Physical Progress Distribution */}
          <ChartCard
            title="Physical Progress Distribution"
            subtitle="Distribution of projects by completion %"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Budget by Risk Level */}
          <ChartCard
            title="Expenditure by Risk Level"
            subtitle="Budget allocated and spent by risk category"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetByRiskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="projects" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Risk vs Progress Scatter */}
          <ChartCard
            title="Progress vs Cost Escalation"
            subtitle="Relationship between physical progress and cost increase"
          >
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                data={riskProgressData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="progress" name="Progress %" />
                <YAxis dataKey="cost_escalation" name="Cost %" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Projects"
                  data={riskProgressData}
                  fill="#3b82f6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Expenditure vs Physical Progress */}
          <ChartCard
            title="Budget Utilization vs Progress"
            subtitle="Expenditure rate compared to physical completion"
          >
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                data={expenditureProgressData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="physical_progress"
                  name="Progress %"
                />
                <YAxis dataKey="expenditure" name="Expend %" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Projects"
                  data={expenditureProgressData}
                  fill="#f59e0b"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* State Risk Profile */}
          <ChartCard
            title="State-wise Risk Profile"
            subtitle="Top 10 states by critical + high risk count"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stateRiskData}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="state"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="CRITICAL" fill="#ef4444" />
                <Bar dataKey="HIGH" fill="#f97316" />
                <Bar dataKey="MEDIUM" fill="#f59e0b" />
                <Bar dataKey="LOW" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Insights */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">
            Key Insights
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InsightCard
              title="High Risk Projects"
              value={stats.high + stats.critical}
              color="text-red-600"
              bg="bg-red-50"
            />
            <InsightCard
              title="Avg Budget Utilization"
              value={`${stats.budgetUtilization.toFixed(1)}%`}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <InsightCard
              title="Below 50% Progress"
              value={projects.filter(
                (p) => p.physical_progress < 50
              ).length}
              color="text-orange-600"
              bg="bg-orange-50"
            />
            <InsightCard
              title="Cost Escalation >20%"
              value={projects.filter(
                (p) => p.cost_escalation > 20
              ).length}
              color="text-purple-600"
              bg="bg-purple-50"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatCard({ title, value, trend }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
      {trend && (
        <p className="mt-1 text-xs text-emerald-600">
          {trend}
        </p>
      )}
    </div>
  );
}

function InsightCard({ title, value, color, bg }) {
  return (
    <div className={`rounded-xl border ${bg} p-4`}>
      <p className="text-xs font-semibold text-slate-600">
        {title}
      </p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}

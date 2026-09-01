import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

export default function Benchmarking() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("state"); // state or agency

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

  const portfolioStats = useMemo(() => {
    return calculatePortfolioStats(projects);
  }, [projects]);

  // State-wise comparison
  const stateComparison = useMemo(() => {
    const stateMap = {};

    projects.forEach((p) => {
      const state = p.state || "Unknown";
      if (!stateMap[state]) {
        stateMap[state] = {
          state,
          projects: 0,
          avgProgress: 0,
          avgCostEscalation: 0,
          avgScheduleDelay: 0,
          totalCost: 0,
          totalExpenditure: 0,
          high_risk: 0,
          critical: 0,
        };
      }

      const stats = stateMap[state];
      stats.projects++;
      stats.avgProgress += p.physical_progress || 0;
      stats.avgCostEscalation += p.cost_escalation || 0;
      stats.avgScheduleDelay += p.schedule_delay || 0;
      stats.totalCost += p.revised_cost || 0;
      stats.totalExpenditure += p.cumulative_expenditure || 0;
      if (p.risk_level === "HIGH") stats.high_risk++;
      if (p.risk_level === "CRITICAL") stats.critical++;
    });

    return Object.values(stateMap)
      .map((s) => ({
        ...s,
        avgProgress: (s.avgProgress / s.projects).toFixed(1),
        avgCostEscalation: (s.avgCostEscalation / s.projects).toFixed(1),
        avgScheduleDelay: (s.avgScheduleDelay / s.projects).toFixed(1),
        totalCost: s.totalCost.toFixed(0),
        totalExpenditure: s.totalExpenditure.toFixed(0),
        healthScore: (100 - (s.avgCostEscalation / s.projects + s.avgScheduleDelay / s.projects / 2) / 2).toFixed(0),
      }))
      .sort((a, b) => b.projects - a.projects);
  }, [projects]);

  // Agency-wise comparison
  const agencyComparison = useMemo(() => {
    const agencyMap = {};

    projects.forEach((p) => {
      const agency = p.agency || "Unknown";
      if (!agencyMap[agency]) {
        agencyMap[agency] = {
          agency,
          projects: 0,
          avgProgress: 0,
          avgCostEscalation: 0,
          avgScheduleDelay: 0,
          totalCost: 0,
          totalExpenditure: 0,
          high_risk: 0,
          critical: 0,
        };
      }

      const stats = agencyMap[agency];
      stats.projects++;
      stats.avgProgress += p.physical_progress || 0;
      stats.avgCostEscalation += p.cost_escalation || 0;
      stats.avgScheduleDelay += p.schedule_delay || 0;
      stats.totalCost += p.revised_cost || 0;
      stats.totalExpenditure += p.cumulative_expenditure || 0;
      if (p.risk_level === "HIGH") stats.high_risk++;
      if (p.risk_level === "CRITICAL") stats.critical++;
    });

    return Object.values(agencyMap)
      .map((a) => ({
        ...a,
        avgProgress: (a.avgProgress / a.projects).toFixed(1),
        avgCostEscalation: (a.avgCostEscalation / a.projects).toFixed(1),
        avgScheduleDelay: (a.avgScheduleDelay / a.projects).toFixed(1),
        totalCost: a.totalCost.toFixed(0),
        totalExpenditure: a.totalExpenditure.toFixed(0),
        healthScore: (100 - (a.avgCostEscalation / a.projects + a.avgScheduleDelay / a.projects / 2) / 2).toFixed(0),
      }))
      .sort((a, b) => b.projects - a.projects);
  }, [projects]);

  const displayData =
    view === "state" ? stateComparison : agencyComparison;

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
            <div className="rounded-xl bg-green-600 p-2.5 text-white">
              <BarChart3 size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                Benchmarking & Comparison
              </h1>
              <p className="text-xs text-slate-500">
                Performance across states and agencies
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
        {/* View Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView("state")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              view === "state"
                ? "bg-green-600 text-white"
                : "border bg-white hover:bg-slate-50"
            }`}
          >
            State Comparison
          </button>
          <button
            onClick={() => setView("agency")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              view === "agency"
                ? "bg-green-600 text-white"
                : "border bg-white hover:bg-slate-50"
            }`}
          >
            Agency Comparison
          </button>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Average Progress */}
          <ChartCard title="Average Physical Progress">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={view === "state" ? "state" : "agency"}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="avgProgress"
                  fill="#10b981"
                  name="Avg Progress %"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Cost Escalation */}
          <ChartCard title="Average Cost Escalation">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={view === "state" ? "state" : "agency"}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="avgCostEscalation"
                  fill="#f97316"
                  name="Avg Cost Escalation %"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Schedule Delay */}
          <ChartCard title="Average Schedule Delay (Months)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={view === "state" ? "state" : "agency"}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="avgScheduleDelay"
                  fill="#ef4444"
                  name="Avg Delay (mo)"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Project Count */}
          <ChartCard title="Number of Projects">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={view === "state" ? "state" : "agency"}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="projects"
                  fill="#3b82f6"
                  name="Project Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-8 rounded-2xl border bg-white shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                  {view === "state" ? "State" : "Agency"}
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  Projects
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  Avg Progress
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  Cost Escalation
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  Schedule Delay
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  Health Score
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  At Risk
                </th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {row.state || row.agency}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {row.projects}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {row.avgProgress}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={
                        row.avgCostEscalation > 15
                          ? "text-red-600 font-semibold"
                          : "text-slate-600"
                      }
                    >
                      {row.avgCostEscalation}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={
                        row.avgScheduleDelay > 10
                          ? "text-red-600 font-semibold"
                          : "text-slate-600"
                      }
                    >
                      {row.avgScheduleDelay} mo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    <span
                      className={
                        row.healthScore > 70
                          ? "text-green-600"
                          : row.healthScore > 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {row.healthScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {row.critical + row.high_risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Portfolio Summary */}
        <div className="mt-8 rounded-2xl border bg-gradient-to-r from-slate-900 to-slate-800 p-6 shadow-sm text-white">
          <h3 className="font-bold">Portfolio Overview</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className="text-xs text-slate-300">Total Projects</p>
              <p className="mt-2 text-2xl font-bold">
                {portfolioStats.total}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-300">
                Avg Progress
              </p>
              <p className="mt-2 text-2xl font-bold">
                {portfolioStats.avgProgress.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-300">
                Total Outlay
              </p>
              <p className="mt-2 text-2xl font-bold">
                ₹{portfolioStats.totalCosts.toFixed(0)} Cr
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-300">
                Utilized Budget
              </p>
              <p className="mt-2 text-2xl font-bold">
                {portfolioStats.budgetUtilization.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-300">
                High Risk Projects
              </p>
              <p className="mt-2 text-2xl font-bold">
                {portfolioStats.high +
                  portfolioStats.critical}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="font-bold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Grid3x3,
  RefreshCw,
} from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  normalizeProjects,
} from "../utils/projectUtils";

const API_URL = "http://127.0.0.1:5000";

export default function RiskMatrix() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

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

  // Calculate probability (0-100) based on cost escalation and schedule delay
  // Calculate impact (0-100) based on project size (cost) and progress gap
  const matrixData = useMemo(() => {
    return projects.map((p) => {
      // Probability: cost escalation + schedule delay indicators
      const costProbability = Math.min(p.cost_escalation || 0, 50);
      const scheduleProbability = Math.min((p.schedule_delay || 0) / 2, 50);
      const probability = (costProbability + scheduleProbability) / 2;

      // Impact: larger revised cost + higher progress gap = higher impact
      const costImpact = Math.min((p.revised_cost || 0) / 100, 50);
      const progressImpact = Math.min(
        ((100 - (p.physical_progress || 0)) * 0.5),
        50
      );
      const impact = (costImpact + progressImpact) / 2;

      return {
        probability: Math.min(probability, 100),
        impact: Math.min(impact, 100),
        project_id: p.project_id,
        project_name: p.project_name,
        project_code: p.project_code,
        state: p.state,
        risk_level: p.risk_level,
        cost_escalation: p.cost_escalation,
        schedule_delay: p.schedule_delay,
        physical_progress: p.physical_progress,
      };
    });
  }, [projects]);

  // Categorize by risk zones
  const riskZones = useMemo(() => {
    const zones = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    matrixData.forEach((p) => {
      const risk =
        p.probability * p.impact > 5000
          ? "critical"
          : p.probability * p.impact > 2500
            ? "high"
            : p.probability * p.impact > 1000
              ? "medium"
              : "low";
      zones[risk].push(p);
    });

    return zones;
  }, [matrixData]);

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
            <div className="rounded-xl bg-purple-600 p-2.5 text-white">
              <Grid3x3 size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Risk Matrix</h1>
              <p className="text-xs text-slate-500">
                Probability vs Impact visualization
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
        {/* Legend and Summary */}
        <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">Risk Distribution</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <ZoneCard
              title="Critical Risk"
              count={riskZones.critical.length}
              color="bg-red-50 border-red-200"
              textColor="text-red-700"
            />
            <ZoneCard
              title="High Risk"
              count={riskZones.high.length}
              color="bg-orange-50 border-orange-200"
              textColor="text-orange-700"
            />
            <ZoneCard
              title="Medium Risk"
              count={riskZones.medium.length}
              color="bg-yellow-50 border-yellow-200"
              textColor="text-yellow-700"
            />
            <ZoneCard
              title="Low Risk"
              count={riskZones.low.length}
              color="bg-green-50 border-green-200"
              textColor="text-green-700"
            />
          </div>
        </div>

        {/* Matrix Chart */}
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">
            Probability vs Impact Matrix
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            X-axis: Probability (0-100) | Y-axis: Impact (0-100)
          </p>
          <div className="mt-4 h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="probability"
                  name="Probability"
                  domain={[0, 100]}
                />
                <YAxis
                  type="number"
                  dataKey="impact"
                  name="Impact"
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg bg-white p-2 text-xs shadow-lg border">
                          <p className="font-semibold">
                            {data.project_name}
                          </p>
                          <p>Probability: {data.probability.toFixed(1)}</p>
                          <p>Impact: {data.impact.toFixed(1)}</p>
                          <p>Risk: {data.risk_level}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Risk zones as background */}
                <Scatter
                  name="Critical"
                  data={riskZones.critical}
                  fill="#ef4444"
                  fillOpacity={0.7}
                />
                <Scatter
                  name="High"
                  data={riskZones.high}
                  fill="#f97316"
                  fillOpacity={0.7}
                />
                <Scatter
                  name="Medium"
                  data={riskZones.medium}
                  fill="#f59e0b"
                  fillOpacity={0.7}
                />
                <Scatter
                  name="Low"
                  data={riskZones.low}
                  fill="#10b981"
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Zone Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Critical Risk Projects */}
          <RiskZonePanel
            title="🔴 Critical Risk Projects"
            projects={riskZones.critical}
            bgColor="bg-red-50"
            borderColor="border-red-200"
          />

          {/* High Risk Projects */}
          <RiskZonePanel
            title="🟠 High Risk Projects"
            projects={riskZones.high}
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
          />

          {/* Medium Risk Projects */}
          <RiskZonePanel
            title="🟡 Medium Risk Projects"
            projects={riskZones.medium}
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
          />

          {/* Low Risk Projects */}
          <RiskZonePanel
            title="🟢 Low Risk Projects"
            projects={riskZones.low}
            bgColor="bg-green-50"
            borderColor="border-green-200"
          />
        </div>
      </main>
    </div>
  );
}

function ZoneCard({ title, count, color, textColor }) {
  return (
    <div className={`rounded-lg border p-4 ${color}`}>
      <p className={`text-sm font-semibold ${textColor}`}>
        {title}
      </p>
      <p className={`mt-2 text-2xl font-bold ${textColor}`}>
        {count}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {((count / 143) * 100).toFixed(1)}% of portfolio
      </p>
    </div>
  );
}

function RiskZonePanel({
  title,
  projects,
  bgColor,
  borderColor,
}) {
  return (
    <div
      className={`rounded-2xl border ${borderColor} ${bgColor} p-6 shadow-sm`}
    >
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-600">
        {projects.length} projects
      </p>

      <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
        {projects.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            No projects in this category
          </p>
        ) : (
          projects
            .sort(
              (a, b) =>
                b.probability * b.impact -
                a.probability * a.impact
            )
            .slice(0, 10)
            .map((project) => (
              <Link
                key={project.project_id}
                to={`/projects/${project.project_code}`}
                className="flex items-center justify-between rounded-lg bg-white p-3 text-sm hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {project.project_name}
                  </p>
                  <p className="text-xs text-slate-600">
                    P: {project.probability.toFixed(1)} | I:{" "}
                    {project.impact.toFixed(1)}
                  </p>
                </div>
                <span className="text-blue-600">→</span>
              </Link>
            ))
        )}
      </div>
    </div>
  );
}

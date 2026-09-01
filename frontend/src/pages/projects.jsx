import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  FolderKanban,
  LayoutDashboard,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  normalizeProjects,
  formatPercent,
} from "../utils/projectUtils";

const API_URL = "http://127.0.0.1:5000";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/projects`);

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      const normalizedProjects = normalizeProjects(
        data.projects || []
      );
      setProjects(normalizedProjects);
    } catch (err) {
      setError(
        "Unable to load projects. Make sure the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        String(project.project_name || "")
          .toLowerCase()
          .includes(query) ||
        String(project.state || "")
          .toLowerCase()
          .includes(query) ||
        String(project.agency || "")
          .toLowerCase()
          .includes(query) ||
        String(project.project_code || "")
          .toLowerCase()
          .includes(query);

      const matchesRisk =
        riskFilter === "ALL" ||
        project.risk_level === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [projects, search, riskFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">
            Unable to load projects
          </h2>

          <p className="mt-2 text-slate-500">{error}</p>

          <button
            onClick={fetchProjects}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <FolderKanban size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Project Monitoring Platform
              </h1>
              <p className="text-xs text-slate-500">
                AI-powered project risk intelligence
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <LayoutDashboard size={17} />
              Dashboard
            </Link>

            <Link
              to="/projects"
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
            >
              <FolderKanban size={17} />
              Projects
            </Link>
          </nav>

          <button
            onClick={fetchProjects}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="border-t px-6 py-2 md:hidden">
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            <Link
              to="/projects"
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
            >
              <FolderKanban size={16} />
              Projects
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                All Projects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Monitor project progress, expenditure and AI-generated risk
                predictions.
              </p>
            </div>

            <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-500">Showing</p>
              <p className="text-lg font-bold text-slate-900">
                {filteredProjects.length}{" "}
                <span className="text-sm font-normal text-slate-500">
                  / {projects.length} projects
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search project, state, agency or project code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={17} className="text-slate-500" />

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="CRITICAL">Critical Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Sl. No</th>
                  <th className="px-5 py-4">Project</th>
                  <th className="px-5 py-4">State</th>
                  <th className="px-5 py-4">Agency</th>
                  <th className="px-5 py-4">Progress</th>
                  <th className="px-5 py-4">Expenditure</th>
                  <th className="px-5 py-4">Risk</th>
                  <th className="px-5 py-4">Confidence</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredProjects.map((project, index) => (
                  <tr
                    key={`${project.project_id}-${index}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-500">
                      {index + 1}
                    </td>

                    <td className="max-w-xs px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {project.project_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {project.project_code}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {project.state}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-slate-600">
                      {project.agency}
                    </td>

                    <td className="px-5 py-4">
                      <div className="w-28">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {project.physical_progress.toFixed(1)}%
                          </span>
                        </div>

                        <ProgressBar
                          value={Number(
                            project.physical_progress ||
                              0
                          )}
                        />
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      ₹{project.cumulative_expenditure.toFixed(2)} Cr
                    </td>

                    <td className="px-5 py-4">
                      <RiskBadge risk={project.risk_level} />
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {project.confidence.toFixed(1)}%
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/projects/${encodeURIComponent(
                          project.project_code
                        )}`}
                        state={{ project }}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Details
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-16 text-center"
                    >
                      <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                      <p className="font-semibold text-slate-700">
                        No projects found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or risk filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>Web-Based Integrated Project-Monitoring Platform</p>
          <p>AI Risk Intelligence • SIH 2026</p>
        </div>
      </footer>
    </div>
  );
}

function ProgressBar({ value }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function RiskBadge({ risk }) {
  const styles = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[risk] || "bg-slate-100 text-slate-700"
      }`}
    >
      {risk || "UNKNOWN"}
    </span>
  );
}

export default Projects;
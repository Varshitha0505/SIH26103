import { Link, useLocation, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  Gauge,
  MapPin,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import {
  normalizeProject,
  generateRecommendations,
  getRiskDrivers,
} from "../utils/projectUtils";

function ProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const rawProject = location.state?.project;

  // Normalize project data
  const project = normalizeProject(rawProject || {});

  if (!rawProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />

          <h2 className="text-xl font-bold text-slate-900">
            Project Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Project information is not available. Please return to the
            projects list and select a project again.
          </p>

          <Link
            to="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // Get risk drivers and recommendations
  const riskDrivers = getRiskDrivers(project);
  const recommendations_data =
    generateRecommendations(project);

  const risk = project.risk_level || "UNKNOWN";
  const progress = project.physical_progress || 0;
  const confidence = project.confidence || 0;
  const scheduleDelay = project.schedule_delay || 0;
  const costEscalation = project.cost_escalation || 0;
  const expenditure = project.expenditure || 0;
  const progressGap = project.progress_gap || 0;

  const riskConfig = {
    LOW: {
      label: "LOW RISK",
      description:
        "Project is currently performing within acceptable parameters.",
      icon: CheckCircle2,
      classes:
        "bg-green-100 text-green-700 border-green-200",
      banner: "bg-green-50 border-green-200",
    },
    MEDIUM: {
      label: "MEDIUM RISK",
      description:
        "Project should be monitored for emerging performance issues.",
      icon: Clock3,
      classes:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
      banner: "bg-yellow-50 border-yellow-200",
    },
    HIGH: {
      label: "HIGH RISK",
      description:
        "Project requires close monitoring and corrective action.",
      icon: AlertTriangle,
      classes:
        "bg-orange-100 text-orange-700 border-orange-200",
      banner: "bg-orange-50 border-orange-200",
    },
    CRITICAL: {
      label: "CRITICAL RISK",
      description:
        "Project requires immediate intervention from responsible authorities.",
      icon: ShieldAlert,
      classes: "bg-red-100 text-red-700 border-red-200",
      banner: "bg-red-50 border-red-200",
    },
  };

  const config = riskConfig[risk] || {
    label: risk,
    description: "Risk assessment available.",
    icon: AlertTriangle,
    classes: "bg-slate-100 text-slate-700 border-slate-200",
    banner: "bg-slate-50 border-slate-200",
  };

  const RiskIcon = config.icon;

  // Get recommendations from utility function
  const recommendations = generateRecommendations(project);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <Gauge size={23} />
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

          <Link
            to="/projects"
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">All Projects</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-blue-600">
            Projects
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">
            Project {project.project_id || id}
          </span>
        </div>

        {/* Project Header */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  PROJECT #{project.project_id}
                </span>

                <RiskBadge risk={risk} />
              </div>

              <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                {project.project_name}
              </h2>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Building2 size={16} />
                  {project.agency}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {project.state}
                </span>

                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  {project.project_code}
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl border px-5 py-4 ${config.banner} lg:min-w-[280px]`}
            >
              <div className="flex items-center gap-3">
                <RiskIcon size={26} />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                    AI Risk Assessment
                  </p>

                  <p className="mt-1 text-lg font-bold">{config.label}</p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed opacity-80">
                {config.description}
              </p>
            </div>
          </div>
        </section>

        {/* AI Risk Assessment */}
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2">
                <ShieldAlert size={21} />
              </div>

              <div>
                <h3 className="font-bold">AI Risk Assessment</h3>
                <p className="text-xs text-slate-300">
                  Machine-learning based project health indicators
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Risk Level"
              value={risk}
              icon={<ShieldAlert size={20} />}
              valueClass={riskTextClass(risk)}
            />

            <MetricCard
              title="Prediction Confidence"
              value={`${confidence}%`}
              icon={<Gauge size={20} />}
              valueClass="text-blue-600"
            />

            <MetricCard
              title="Progress Gap"
              value={`${progressGap}%`}
              icon={<TrendingUp size={20} />}
              valueClass={progressGap > 20 ? "text-red-600" : "text-slate-900"}
            />

            <MetricCard
              title="Schedule Delay"
              value={`${scheduleDelay}%`}
              icon={<Clock3 size={20} />}
              valueClass={
                scheduleDelay > 20 ? "text-red-600" : "text-slate-900"
              }
            />
          </div>
        </section>

        {/* Performance */}
        <section>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              Project Performance
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Key financial and physical performance indicators
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PerformanceCard
              title="Physical Progress"
              value={`${progress}%`}
              icon={<TrendingUp size={21} />}
              progress={progress}
            />

            <PerformanceCard
              title="Expenditure"
              value={`₹${project.cumulative_expenditure.toFixed(2)} Cr`}
              icon={<DollarSign size={21} />}
              progress={Math.min(expenditure, 100)}
            />

            <PerformanceCard
              title="Cost Escalation"
              value={`${costEscalation}%`}
              icon={<AlertTriangle size={21} />}
              progress={Math.min(Math.max(costEscalation, 0), 100)}
            />
          </div>
        </section>

        {/* Project Information */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">
              Project Information
            </h3>
          </div>

          <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <InfoRow label="Project Code" value={project.project_code} />
            <InfoRow label="State" value={project.state} />
            <InfoRow label="Agency" value={project.agency} />
            <InfoRow label="Approval Date" value={project.approval_date} />
            <InfoRow label="Start Date" value={project.start_date} />
            <InfoRow label="Target DoC" value={project.target_doc} />
            <InfoRow label="Revised DoC" value={project.revised_doc} />
            <InfoRow
              label="Original Cost"
              value={`₹${project.original_cost.toFixed(2)} Cr`}
            />
            <InfoRow
              label="Revised Cost"
              value={`₹${project.revised_cost.toFixed(2)} Cr`}
            />
            <InfoRow
              label="Cumulative Expenditure"
              value={`₹${project.cumulative_expenditure.toFixed(2)} Cr`}
            />
          </div>
        </section>

        {/* AI Findings + Recommendations */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">
                Detected Risk Factors
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Factors contributing to the AI risk prediction
              </p>
            </div>

            <div className="p-6">
              {project.risk_factors ? (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 shrink-0 text-red-500" />
                    <p className="text-sm leading-6 text-red-800">
                      {project.risk_factors}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                  No major risk factors detected.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">
                Recommended Actions
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Suggested actions based on detected project risks
              </p>
            </div>

            <div className="space-y-3 p-6">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border bg-slate-50 p-4"
                >
                  <div className="mt-0.5 rounded-full bg-blue-100 p-1.5 text-blue-600">
                    <CheckCircle2 size={16} />
                  </div>

                  <p className="text-sm leading-6 text-slate-700">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom navigation */}
        <div className="flex justify-between border-t pt-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, valueClass }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>

      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function PerformanceCard({ title, value, icon, progress }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          {icon}
        </div>

        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${Math.min(Math.max(progress || 0, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800">
        {value || "-"}
      </span>
    </div>
  );
}

function RiskBadge({ risk }) {
  const styles = {
    LOW: "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${
        styles[risk] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {risk}
    </span>
  );
}

function riskTextClass(risk) {
  const classes = {
    LOW: "text-green-600",
    MEDIUM: "text-yellow-600",
    HIGH: "text-orange-600",
    CRITICAL: "text-red-600",
  };

  return classes[risk] || "text-slate-900";
}

export default ProjectDetails;
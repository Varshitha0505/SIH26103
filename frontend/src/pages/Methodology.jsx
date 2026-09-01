import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  Gauge,
  Grid3x3,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2.5 text-white">
              <BookOpen size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                Methodology & Documentation
              </h1>
              <p className="text-xs text-slate-500">
                System design, calculations, and AI model details
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Table of Contents */}
        <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Quick Navigation</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TOCLink href="#risk-scoring" title="Risk Scoring" />
            <TOCLink href="#early-warnings" title="Early Warnings" />
            <TOCLink href="#recommendations" title="Recommendations" />
            <TOCLink href="#analytics" title="Analytics" />
            <TOCLink href="#benchmarking" title="Benchmarking" />
            <TOCLink href="#risk-matrix" title="Risk Matrix" />
          </div>
        </div>

        {/* Risk Scoring */}
        <Section
          id="risk-scoring"
          icon={<Shield size={24} />}
          title="Risk Scoring Methodology"
          color="blue"
        >
          <p>
            The AI Risk Assessment combines multiple project indicators into a
            single 0-100 risk score:
          </p>

          <div className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
            <ScoreComponent
              factor="Cost Escalation"
              weight="30 points"
              description="(Revised Cost - Original Cost) / Original Cost × 100, capped at 30pts"
            />
            <ScoreComponent
              factor="Schedule Delay"
              weight="30 points"
              description="(Revised DoC - Target DoC) / Target DoC × 100, capped at 30pts"
            />
            <ScoreComponent
              factor="Progress Gap"
              weight="20 points"
              description="(100% - Physical Progress), measuring deviation from expected progress"
            />
            <ScoreComponent
              factor="Expenditure Rate"
              weight="10 points"
              description="(Expenditure % - Physical Progress %), indicating over/under-spending"
            />
            <ScoreComponent
              factor="Physical Progress"
              weight="5 points"
              description="Negative adjustment if progress < 30%, encouraging early action"
            />
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Base Score: 50 + adjustments
            </p>
            <p className="text-sm text-blue-800">
              <strong>LOW (0-40):</strong> Stable project, on track
            </p>
            <p className="text-sm text-blue-800">
              <strong>MEDIUM (41-60):</strong> Monitor closely, early interventions
            </p>
            <p className="text-sm text-blue-800">
              <strong>HIGH (61-80):</strong> Significant issues, active management required
            </p>
            <p className="text-sm text-blue-800">
              <strong>CRITICAL (81-100):</strong> Severe risk, immediate escalation needed
            </p>
          </div>
        </Section>

        {/* Early Warnings */}
        <Section
          id="early-warnings"
          icon={<Zap size={24} />}
          title="Early Warning System"
          color="red"
        >
          <p>
            Automated alerts identify projects requiring immediate attention based on
            threshold violations:
          </p>

          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <WarningThreshold
              name="Cost Escalation > 20%"
              severity="HIGH"
              action="Review cost controls, consider rebudgeting"
            />
            <WarningThreshold
              name="Cost Escalation > 10% (with HIGH risk)"
              severity="MEDIUM"
              action="Initiate value engineering review"
            />
            <WarningThreshold
              name="Schedule Delay > 30 months"
              severity="HIGH"
              action="Acceleration plan required"
            />
            <WarningThreshold
              name="Schedule Delay > 15 months"
              severity="MEDIUM"
              action="Schedule risk assessment"
            />
            <WarningThreshold
              name="Progress Gap > 30%"
              severity="HIGH"
              action="Capacity planning intervention"
            />
            <WarningThreshold
              name="Progress Gap > 15%"
              severity="MEDIUM"
              action="Progress monitoring intensification"
            />
            <WarningThreshold
              name="Physical Progress < 30%"
              severity="MEDIUM"
              action="Project health review"
            />
            <WarningThreshold
              name="Expenditure Rate > 90%"
              severity="MEDIUM"
              action="Budget buffer assessment"
            />
          </div>
        </Section>

        {/* Recommendations */}
        <Section
          id="recommendations"
          icon={<TrendingUp size={24} />}
          title="Prescriptive Recommendations"
          color="green"
        >
          <p>
            AI-generated recommendations are prioritized based on risk severity and
            actionability:
          </p>

          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <Recommendation
              priority="IMMEDIATE"
              trigger="CRITICAL risk level"
              action="Escalate to senior management, establish crisis task force"
            />
            <Recommendation
              priority="IMMEDIATE"
              trigger="Cost Escalation > 30%"
              action="Emergency procurement review, consider design modifications"
            />
            <Recommendation
              priority="IMMEDIATE"
              trigger="Schedule Delay > 30mo"
              action="Resource augmentation plan, parallel activity analysis"
            />
            <Recommendation
              priority="ROUTINE"
              trigger="HIGH risk level"
              action="Monthly project reviews, enhanced stakeholder engagement"
            />
            <Recommendation
              priority="ROUTINE"
              trigger="Cost Escalation > 15%"
              action="Implement earned value management, cost forecasting"
            />
            <Recommendation
              priority="ROUTINE"
              trigger="Progress Gap > 15%"
              action="Progress tracking intensification, bottleneck analysis"
            />
          </div>
        </Section>

        {/* Analytics Visualizations */}
        <Section
          id="analytics"
          icon={<Gauge size={24} />}
          title="Analytics Dashboard"
          color="purple"
        >
          <p>
            Comprehensive portfolio analytics provide insights into key performance areas:
          </p>

          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <AnalyticsMetric
              name="Cost Escalation Distribution"
              description="Histogram showing project distribution by cost increase percentage"
            />
            <AnalyticsMetric
              name="Schedule Delay Distribution"
              description="Timeline delays across portfolio in months"
            />
            <AnalyticsMetric
              name="Physical Progress Distribution"
              description="Completion percentage distribution of all projects"
            />
            <AnalyticsMetric
              name="Expenditure by Risk Level"
              description="Budget allocation and spending across risk categories"
            />
            <AnalyticsMetric
              name="Progress vs Cost Escalation"
              description="Scatter plot revealing correlation between completion and cost growth"
            />
            <AnalyticsMetric
              name="Budget Utilization vs Progress"
              description="Expenditure rate vs physical completion analysis"
            />
          </div>
        </Section>

        {/* Benchmarking */}
        <Section
          id="benchmarking"
          icon={<TrendingUp size={24} />}
          title="Benchmarking Framework"
          color="emerald"
        >
          <p>
            Performance comparison across states and agencies enables peer learning and
            identification of best practices:
          </p>

          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <BenchmarkMetric
              name="Health Score"
              formula="100 - ((Avg Cost Escalation + Avg Schedule Delay/2) / 2)"
              interpretation="> 70 = Excellent, > 50 = Acceptable, ≤ 50 = At Risk"
            />
            <BenchmarkMetric
              name="Portfolio Utilization"
              formula="(Total Expenditure / Total Revised Cost) × 100"
              interpretation="Indicates overall budget execution efficiency"
            />
            <BenchmarkMetric
              name="Risk Concentration"
              formula="(CRITICAL + HIGH) / Total Projects × 100"
              interpretation="Higher % indicates higher portfolio risk density"
            />
          </div>

          <p className="mt-4 text-sm text-slate-600">
            <strong>Application:</strong> Identify top-performing states/agencies for best
            practice sharing and support struggling units with targeted interventions.
          </p>
        </Section>

        {/* Risk Matrix */}
        <Section
          id="risk-matrix"
          icon={<Grid3x3 size={24} />}
          title="Risk Matrix Analysis"
          color="orange"
        >
          <p>
            Two-dimensional risk assessment plotting projects on probability vs impact grid:
          </p>

          <div className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
            <div>
              <p className="font-semibold text-slate-900 mb-2">Probability Calculation:</p>
              <p className="text-sm text-slate-600">
                (Cost Escalation % / 2 + Schedule Delay % / 4) / 2, normalized to 0-100
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">Impact Calculation:</p>
              <p className="text-sm text-slate-600">
                (Revised Cost / 100 + (100 - Progress) × 0.5) / 2, representing cost magnitude
                and completion gap
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">Risk Zones:</p>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-red-500" /> CRITICAL: P × I &gt; 5000
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-orange-500" /> HIGH: 2500-5000
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-yellow-500" /> MEDIUM: 1000-2500
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-green-500" /> LOW: &lt; 1000
              </p>
            </div>
          </div>
        </Section>

        {/* Data Architecture */}
        <Section
          id="data"
          icon={<Database size={24} />}
          title="Data Architecture"
          color="indigo"
        >
          <p>
            Real-time data integration from project management systems and ML predictions:
          </p>

          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-3">Data Pipeline:</p>
            <div className="space-y-2 text-sm">
              <p>
                <strong className="text-slate-700">Source:</strong> 143 projects from
                project_predictions.csv
              </p>
              <p>
                <strong className="text-slate-700">Fields:</strong> Project metadata, costs,
                timeline, progress, ML predictions
              </p>
              <p>
                <strong className="text-slate-700">Update Frequency:</strong> Real-time from
                Flask backend API
              </p>
              <p>
                <strong className="text-slate-700">ML Model:</strong> Pre-trained Random Forest
                classifier with 85%+ accuracy
              </p>
            </div>
          </div>
        </Section>

        {/* API Integration */}
        <Section
          id="api"
          icon={<Code2 size={24} />}
          title="API Integration"
          color="cyan"
        >
          <p>
            Backend API serves normalized project data to frontend components:
          </p>

          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs">
            <p className="text-slate-700 mb-3">
              <strong>Endpoint:</strong> GET http://127.0.0.1:5000/projects
            </p>
            <p className="text-slate-700">
              <strong>Response:</strong> JSON with status, total_projects, and projects array
            </p>
            <p className="text-slate-700 mt-2">
              <strong>Normalization:</strong> Frontend projectUtils.js standardizes field names
              across components
            </p>
          </div>
        </Section>

        {/* Version Info */}
        <div className="mt-8 rounded-2xl border bg-gradient-to-r from-slate-900 to-slate-800 p-6 shadow-sm text-white">
          <h3 className="mb-4 font-bold">System Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Platform" value="ProjectIQ v1.0" />
            <InfoItem label="Frontend" value="React 19.2 + Vite 8.2" />
            <InfoItem label="Backend" value="Flask + Python 3.14" />
            <InfoItem label="ML Model" value="Random Forest Classifier" />
            <InfoItem label="Database" value="CSV-based dataset (143 projects)" />
            <InfoItem label="Deployment" value="Local development mode" />
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ id, icon, title, color, children }) {
  const colorStyles = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    cyan: "bg-cyan-50 border-cyan-200 text-cyan-700",
  };

  return (
    <section
      id={id}
      className={`mb-6 rounded-2xl border p-6 shadow-sm ${colorStyles[color]}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="text-slate-600 space-y-3">{children}</div>
    </section>
  );
}

function TOCLink({ href, title }) {
  return (
    <a
      href={href}
      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
    >
      {title}
    </a>
  );
}

function ScoreComponent({ factor, weight, description }) {
  return (
    <div className="flex gap-3 border-b border-slate-200 pb-3 last:border-0">
      <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-slate-400" />
      <div>
        <p className="font-semibold text-slate-900">
          {factor} — {weight}
        </p>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function WarningThreshold({ name, severity, action }) {
  const severityColor = {
    HIGH: "bg-red-100 text-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
  }[severity];

  return (
    <div className="border-b border-slate-200 pb-2 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <span className={`inline-flex rounded px-2 py-1 text-xs font-bold ${severityColor}`}>
          {severity}
        </span>
        <span className="font-medium text-slate-900">{name}</span>
      </div>
      <p className="text-xs text-slate-600 ml-[calc(2.5rem)]">{action}</p>
    </div>
  );
}

function Recommendation({ priority, trigger, action }) {
  const priorityColor = {
    IMMEDIATE: "bg-red-100 text-red-800",
    ROUTINE: "bg-blue-100 text-blue-800",
  }[priority];

  return (
    <div className="border-b border-slate-200 pb-2 last:border-0">
      <div className="flex gap-2 mb-1">
        <span className={`inline-flex rounded px-2 py-1 text-xs font-bold whitespace-nowrap ${priorityColor}`}>
          {priority}
        </span>
        <span className="text-xs text-slate-600">
          <strong>When:</strong> {trigger}
        </span>
      </div>
      <p className="text-xs text-slate-700 ml-0">
        <strong>Action:</strong> {action}
      </p>
    </div>
  );
}

function AnalyticsMetric({ name, description }) {
  return (
    <div className="border-b border-slate-200 pb-2 last:border-0">
      <p className="font-medium text-slate-900">{name}</p>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}

function BenchmarkMetric({ name, formula, interpretation }) {
  return (
    <div className="border-b border-slate-200 pb-2 last:border-0">
      <p className="font-medium text-slate-900">{name}</p>
      <p className="text-xs text-slate-600 font-mono">
        <strong>Formula:</strong> {formula}
      </p>
      <p className="text-xs text-slate-600">
        <strong>Interpretation:</strong> {interpretation}
      </p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-200">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

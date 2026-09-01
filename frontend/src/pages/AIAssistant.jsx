import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BrainCircuit,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import {
  normalizeProjects,
  generateRecommendations,
  getRiskDrivers,
} from "../utils/projectUtils";

const API_URL = "http://127.0.0.1:5000";

export default function AIAssistant() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      content:
        "Hello! I'm ProjectIQ Assistant. I can help you understand risk patterns, generate recommendations, and provide insights into your project portfolio. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      const normalized = normalizeProjects(
        data.projects || []
      );
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

  const insights = useMemo(() => {
    if (!projects.length) return {};

    const critical = projects.filter(
      (p) => p.risk_level === "CRITICAL"
    ).length;
    const high = projects.filter(
      (p) => p.risk_level === "HIGH"
    ).length;
    const avgProgress = (
      projects.reduce(
        (sum, p) => sum + p.physical_progress,
        0
      ) / projects.length
    ).toFixed(1);
    const avgCostEscalation = (
      projects.reduce(
        (sum, p) => sum + p.cost_escalation,
        0
      ) / projects.length
    ).toFixed(1);

    return {
      critical,
      high,
      avgProgress,
      avgCostEscalation,
      total: projects.length,
    };
  }, [projects]);

  const generateAssistantResponse = (userMessage) => {
    const lower = userMessage.toLowerCase();

    if (
      lower.includes("critical") ||
      lower.includes("urgent")
    ) {
      const criticalProjects = projects.filter(
        (p) => p.risk_level === "CRITICAL"
      );
      return `There are ${criticalProjects.length} projects at CRITICAL risk level. The top concern is immediate intervention needed for: ${
        criticalProjects
          .slice(0, 3)
          .map((p) => p.project_name)
          .join(", ")
      }. I recommend initiating crisis management protocols for these projects.`;
    }

    if (
      lower.includes("progress") ||
      lower.includes("completion")
    ) {
      const lowProgress = projects.filter(
        (p) => p.physical_progress < 30
      );
      return `Portfolio average progress is ${insights.avgProgress}%. However, ${lowProgress.length} projects are below 30% completion. Key concerns: ${lowProgress
        .slice(0, 3)
        .map(
          (p) => `${p.project_name} (${p.physical_progress}%)`
        )
        .join(", ")}. These need immediate attention to recover schedule.`;
    }

    if (
      lower.includes("cost") ||
      lower.includes("budget")
    ) {
      const highCost = projects.filter(
        (p) => p.cost_escalation > 20
      );
      return `Average cost escalation is ${insights.avgCostEscalation}%. ${highCost.length} projects have experienced cost escalation > 20%. Top escalations: ${highCost
        .slice(0, 3)
        .map(
          (p) =>
            `${p.project_name} (+${p.cost_escalation}%)`
        )
        .join(", ")}. Consider value engineering and procurement review.`;
    }

    if (
      lower.includes("risk") ||
      lower.includes("danger")
    ) {
      return `Current risk profile: ${insights.critical} CRITICAL, ${insights.high} HIGH risk projects. Risk drivers are primarily cost escalation (avg ${insights.avgCostEscalation}%) and schedule delays. Priority actions: 1) Initiate escalation protocols for CRITICAL projects, 2) Implement cost control measures, 3) Review schedule feasibility.`;
    }

    if (lower.includes("help")) {
      return "I can help you with: portfolio risk analysis, project status summaries, trend identification, recommendations, escalation advice, and comparison insights. Ask about critical projects, progress status, cost trends, or any specific project.";
    }

    if (lower.includes("recommendation")) {
      const atRisk = projects.filter(
        (p) =>
          p.risk_level === "HIGH" ||
          p.risk_level === "CRITICAL"
      );
      const recs = [];
      atRisk.slice(0, 3).forEach((p) => {
        const recommendations =
          generateRecommendations(p);
        recs.push(
          `${p.project_name}: ${recommendations[0]}`
        );
      });
      return `Key recommendations: ${recs.join("; ")}`;
    }

    return `Based on your query about "${userMessage}", here's what I found: The portfolio has ${insights.total} projects total. ${insights.critical} are at CRITICAL risk and ${insights.high} are at HIGH risk. Average physical progress stands at ${insights.avgProgress}% with cost escalation averaging ${insights.avgCostEscalation}%. Would you like specific details about any area?`;
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      type: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Generate and add assistant response
    const assistantResponse = {
      type: "assistant",
      content: generateAssistantResponse(input),
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, assistantResponse]);
    }, 500);

    setInput("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
              <BrainCircuit size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                AI Intelligence Assistant
              </h1>
              <p className="text-xs text-slate-500">
                Ask about portfolio risks, trends, and recommendations
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

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {msg.type === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                        <Sparkles size={18} className="text-indigo-600" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t bg-white px-6 py-4">
            <div className="mx-auto max-w-2xl">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about risks, trends, or recommendations..."
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Try asking: "Show critical risks", "What's the progress?", "Cost trends?"
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Questions Sidebar (on larger screens) */}
        <div className="hidden border-l bg-white px-6 py-6 lg:block lg:w-64">
          <h3 className="mb-4 font-bold text-slate-900">
            Quick Insights
          </h3>
          <div className="space-y-3">
            <InsightBox
              title="Portfolio Status"
              value={`${insights.total} projects`}
              subtext={`${insights.critical} critical`}
            />
            <InsightBox
              title="Avg Progress"
              value={`${insights.avgProgress}%`}
              subtext="Physical completion"
            />
            <InsightBox
              title="Avg Cost Escalation"
              value={`${insights.avgCostEscalation}%`}
              subtext="Above budget"
            />
            <InsightBox
              title="At-Risk Count"
              value={`${insights.critical + insights.high}`}
              subtext="Critical + High"
            />
          </div>

          <h3 className="mb-4 mt-6 font-bold text-slate-900">
            Suggested Questions
          </h3>
          <div className="space-y-2">
            {[
              "Show all critical risks",
              "What's causing delays?",
              "Cost escalation analysis",
              "Top recommendations",
              "Portfolio health status",
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInput(q)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightBox({ title, value, subtext }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-600">
        {title}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  );
}

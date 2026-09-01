import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Analytics from "./pages/Analytics";
import EarlyWarnings from "./pages/EarlyWarnings";
import RiskMatrix from "./pages/RiskMatrix";
import Benchmarking from "./pages/Benchmarking";
import AIAssistant from "./pages/AIAssistant";
import Methodology from "./pages/Methodology";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/early-warnings" element={<EarlyWarnings />} />
        <Route path="/risk-matrix" element={<RiskMatrix />} />
        <Route path="/benchmarking" element={<Benchmarking />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/methodology" element={<Methodology />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
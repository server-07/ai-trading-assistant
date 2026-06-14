import Dashboard from "@/components/Dashboard";
import CopilotDrawer from "@/components/CopilotDrawer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30 flex flex-col relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cyan-900/20 blur-[120px]"></div>
      </div>

      {/* Main Dashboard Content */}
      <Dashboard />
      
      {/* Gemini AI Copilot Integration */}
      <CopilotDrawer />

      {/* Compliance Disclaimer Footer */}
      <footer className="mt-auto border-t border-white/10 bg-black/60 backdrop-blur-xl p-6 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="max-w-3xl">
            <strong className="text-zinc-300">DISCLAIMER:</strong> This AI-powered dashboard generates predictive momentum forecasts using algorithmic and LLM-based sentiment analysis. 
            <strong> IT IS NOT FINANCIAL ADVICE.</strong> The outputs are for educational and informational purposes only. Trading involves significant risk, and there are no guaranteed returns. Please consult a registered financial advisor before making any investment decisions.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-300 transition-colors">SEBI Guidelines</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">SEC Regulations</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

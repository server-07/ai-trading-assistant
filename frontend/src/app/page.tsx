import Dashboard from "@/components/Dashboard";
import CopilotDrawer from "@/components/CopilotDrawer";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth-actions";
import Link from "next/link";
import { LogOut, ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";
export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isApproved = false;
  let isAdmin = false;
  let fullName = "";

  // BYPASS LOGIC FOR TESTING
  const cookieStore = await cookies();
  const hasBypassCookie = cookieStore.get('bypass_auth')?.value === 'true';

  if (hasBypassCookie) {
    isApproved = true;
    isAdmin = true;
    fullName = "Server Admin (Bypass)";
  } else if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_approved, role, full_name')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      isApproved = profile.is_approved;
      isAdmin = profile.role === 'admin';
      fullName = profile.full_name || "Trader";
    }
  }

  return (
    <main className="flex-1 flex flex-col relative z-10">

      {/* Header / Auth Navigation */}
      <div className="absolute top-4 right-4 z-50 flex gap-4 items-center">
        {fullName && (
          <div className="text-sm font-medium text-zinc-300 mr-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Hi, {fullName}
          </div>
        )}
        {isAdmin && (
          <Link href="/admin" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition bg-cyan-900/20 px-3 py-1.5 rounded-full border border-cyan-800/50">
            Admin Panel
          </Link>
        )}
        <form action={signOut}>
          <button className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50 backdrop-blur-md">
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>

      {!isApproved ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <ShieldAlert size={40} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Pending Approval</h1>
          <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
            Your account has been created successfully, but it requires administrator approval before you can access the trading dashboard.
          </p>
          <p className="text-zinc-500 mt-8 text-sm">
            Please check back later or contact the administrator.
          </p>
        </div>
      ) : (
        <>
          {/* Main Dashboard Content */}
          <Dashboard />
          
          {/* Gemini AI Copilot Integration */}
          <CopilotDrawer />
        </>
      )}

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


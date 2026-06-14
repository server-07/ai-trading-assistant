import { login, signup } from './actions'
import { Activity } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-6 mt-16 mx-auto relative z-10 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(8,145,178,0.2)] backdrop-blur-md">
          <Activity className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
          PrePulse AI
        </h1>
        <p className="text-sm text-zinc-400 font-medium">
          Authorized Access Only
        </p>
      </div>

      {/* Form Container */}
      <form className="flex-1 flex flex-col w-full gap-4 text-foreground p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group">
        
        {/* Subtle internal glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
        
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider ml-1" htmlFor="email">
            Email
          </label>
          <input
            className="w-full rounded-xl px-4 py-3 bg-black/40 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-white placeholder-zinc-600"
            name="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-1 mb-2">
          <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider ml-1" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-xl px-4 py-3 bg-black/40 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-white placeholder-zinc-600"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          formAction={login}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl px-4 py-3.5 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] active:scale-[0.98]"
        >
          Sign In
        </button>
        
        <button
          formAction={signup}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold rounded-xl px-4 py-3.5 transition-all active:scale-[0.98]"
        >
          Create Account
        </button>

        {searchParams?.message && (
          <div className="mt-4 p-4 bg-zinc-900/80 border border-cyan-900/50 rounded-xl flex items-start gap-3 animate-in slide-in-from-bottom-2">
            <p className="text-sm text-cyan-400 leading-relaxed">
              {searchParams.message}
            </p>
          </div>
        )}
      </form>
      
      {/* Footer text */}
      <p className="text-center text-xs text-zinc-600 font-medium mt-4">
        Protected by advanced encryption.
      </p>
    </div>
  )
}

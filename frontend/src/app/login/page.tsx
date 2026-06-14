'use client'

import { useState } from 'react'
import { Activity, Loader2, AlertCircle, CheckCircle2, Shield, TrendingUp } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState<'signin' | 'signup' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (action: 'signin' | 'signup', e: React.FormEvent) => {
    e.preventDefault()
    setLoading(action)
    setError(null)
    setSuccess(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(null)
      return
    }

    try {
      if (action === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setSuccess('Account created successfully! Please wait for an administrator to approve your access.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full min-h-screen z-10">
      
      {/* Left Side: Branding & Info */}
      <div className="hidden md:flex flex-col justify-center w-1/2 p-12 lg:p-20 border-r border-white/5 relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10"></div>
        <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="h-20 w-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(8,145,178,0.2)]">
            <Activity className="w-10 h-10 text-cyan-400" />
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-br from-white via-cyan-100 to-cyan-500 bg-clip-text text-transparent tracking-tight">
            PrePulse AI
          </h1>
          
          <p className="text-lg text-zinc-400 leading-relaxed font-light">
            Advanced pre-market predictive modeling and algorithmic sentiment intelligence. Connect to the global markets before they open.
          </p>

          <div className="space-y-4 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 text-zinc-300">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-cyan-400"/></div>
              <span className="text-sm font-medium">Real-time vector embeddings</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><Shield className="w-4 h-4 text-emerald-400"/></div>
              <span className="text-sm font-medium">Bank-grade encryption & RLS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-24 relative">
        <div className="max-w-md w-full mx-auto animate-in slide-in-from-right-8 fade-in duration-700">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col items-center mb-10 space-y-4">
            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(8,145,178,0.2)]">
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              PrePulse AI
            </h1>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            {/* Subtle internal glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-sm text-zinc-400 mb-8">Enter your credentials to access the terminal.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200 leading-relaxed">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-200 leading-relaxed">{success}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest ml-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full rounded-xl px-4 py-3.5 bg-black/40 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-white placeholder-zinc-600 text-sm"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest ml-1" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full rounded-xl px-4 py-3.5 bg-black/40 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-white placeholder-zinc-600 text-sm"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={(e) => handleAuth('signin', e)}
                  disabled={!!loading}
                  className="relative flex justify-center items-center w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl px-4 py-4 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading === 'signin' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </button>
                
                <button
                  onClick={(e) => handleAuth('signup', e)}
                  disabled={!!loading}
                  className="flex justify-center items-center w-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold rounded-xl px-4 py-4 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                >
                  {loading === 'signup' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-[10px] text-zinc-600 font-medium mt-8 uppercase tracking-widest">
            Protected by Advanced Encryption
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Activity, Loader2, AlertCircle, CheckCircle2, Shield, TrendingUp, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    
    if (isSignUp && fullName.trim().length < 2) {
      setError('Please provide your full name')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })
        if (signUpError) throw signUpError
        setSuccess('Account created! Please wait for an administrator to approve your access.')
        // Reset form to sign in mode after successful signup
        setIsSignUp(false)
        setPassword('')
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
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full min-h-screen z-10 bg-[#050505] text-zinc-300">
      
      {/* Left Side: Obsidian Glass Branding */}
      <div className="hidden md:flex flex-col justify-center w-[45%] p-12 lg:p-20 relative overflow-hidden border-r border-white/5">
        {/* Dynamic mesh gradients for obsidian look */}
        <div className="absolute top-0 left-0 w-full h-full bg-[#050505] -z-20"></div>
        <div className="absolute -top-[30%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-900/20 blur-[130px] -z-10"></div>
        <div className="absolute top-[50%] -right-[20%] w-[60%] h-[60%] rounded-full bg-cyan-900/10 blur-[100px] -z-10"></div>
        
        <div className="max-w-md mx-auto space-y-10 animate-in slide-in-from-left-8 duration-1000 ease-out relative z-10">
          <div className="h-24 w-24 bg-black/40 border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(8,145,178,0.15)] backdrop-blur-xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <Activity className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-white">
              PrePulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">AI</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed font-light tracking-wide max-w-sm">
              The institutional-grade terminal for predictive momentum and real-time catalyst intelligence.
            </p>
          </div>

          <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-10 h-10 rounded-2xl bg-black border border-white/5 flex items-center justify-center group-hover:border-cyan-500/30 transition-colors shadow-inner">
                <TrendingUp className="w-4 h-4 text-cyan-400"/>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Vector Sentiment Engine</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Real-time NLP models</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-10 h-10 rounded-2xl bg-black border border-white/5 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors shadow-inner">
                <Shield className="w-4 h-4 text-indigo-400"/>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">End-to-End Encryption</h4>
                <p className="text-xs text-zinc-500 mt-0.5">SOC2 compliant architecture</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-32 relative bg-[#0a0a0a]">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex flex-col items-center mb-10 space-y-4 pt-10">
          <div className="h-16 w-16 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(8,145,178,0.2)]">
            <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white">
            PrePulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">AI</span>
          </h1>
        </div>

        <div className="w-full max-w-md mx-auto animate-in slide-in-from-right-8 fade-in duration-700 ease-out">
          
          {/* Header */}
          <div className="mb-8 space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-zinc-500">
              {isSignUp ? 'Enter your details to request terminal access.' : 'Sign in to access your dashboard.'}
            </p>
          </div>

          {/* Error / Success Banners */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200/90 leading-relaxed">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-200/90 leading-relaxed">{success}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleAuth}>
            
            {/* Animated Full Name Field (Only visible on Sign Up) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isSignUp ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1.5 relative group">
                <input
                  className="peer w-full rounded-2xl px-5 py-4 bg-[#111] border border-white/5 focus:border-cyan-500/50 focus:bg-[#151515] focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-white placeholder-transparent text-sm shadow-inner"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  required={isSignUp}
                />
                <label className="absolute left-5 -top-2.5 bg-[#0a0a0a] px-1 text-[10px] font-bold uppercase tracking-widest text-cyan-500 transition-all peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-cyan-500 peer-focus:bg-[#0a0a0a]">
                  Full Name
                </label>
                <User className="absolute right-5 top-4 w-5 h-5 text-zinc-600 peer-focus:text-cyan-500/50 transition-colors pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5 relative group">
              <input
                className="peer w-full rounded-2xl px-5 py-4 bg-[#111] border border-white/5 focus:border-cyan-500/50 focus:bg-[#151515] focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-white placeholder-transparent text-sm shadow-inner"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
              />
              <label className="absolute left-5 -top-2.5 bg-[#0a0a0a] px-1 text-[10px] font-bold uppercase tracking-widest text-cyan-500 transition-all peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-cyan-500 peer-focus:bg-[#0a0a0a]">
                Email Address
              </label>
            </div>

            <div className="space-y-1.5 relative group">
              <input
                className="peer w-full rounded-2xl px-5 py-4 bg-[#111] border border-white/5 focus:border-cyan-500/50 focus:bg-[#151515] focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-white placeholder-transparent text-sm shadow-inner"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <label className="absolute left-5 -top-2.5 bg-[#0a0a0a] px-1 text-[10px] font-bold uppercase tracking-widest text-cyan-500 transition-all peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-cyan-500 peer-focus:bg-[#0a0a0a]">
                Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 relative flex justify-center items-center w-full bg-white text-black font-bold rounded-2xl px-4 py-4 transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Submit Request' : 'Access Terminal')}
            </button>
          </form>

          {/* Toggle Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setSuccess(null)
              }}
              type="button"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Apply for access"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}

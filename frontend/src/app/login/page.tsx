import { login, signup } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
      <div className="flex justify-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          AI Trading Assistant
        </h1>
      </div>
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.05)]">
        <label className="text-md text-zinc-300 font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-3 bg-zinc-950 border border-zinc-800 mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md text-zinc-300 font-medium" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-3 bg-zinc-950 border border-zinc-800 mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <button
          formAction={login}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md px-4 py-3 transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]"
        >
          Sign In
        </button>
        <button
          formAction={signup}
          className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-md px-4 py-3 mt-2 transition-colors"
        >
          Sign Up
        </button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-zinc-900/80 border border-zinc-800 text-center text-sm rounded-md text-cyan-400">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}

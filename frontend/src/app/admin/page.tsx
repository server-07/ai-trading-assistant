import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { approveUser } from './actions'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Verify Admin Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-zinc-400 mb-8">You must be an admin to view this page.</p>
        <Link href="/" className="px-6 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  // 3. Fetch all users
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <Link href="/" className="px-4 py-2 border border-zinc-700 rounded-md hover:bg-zinc-800 transition">
            Back to App
          </Link>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-zinc-300">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-700/50 text-zinc-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {u.is_approved ? (
                      <span className="text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div> Approved
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'admin' && (
                      <form>
                        <button
                          formAction={async () => {
                            'use server'
                            await approveUser(u.id, !u.is_approved)
                          }}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                            u.is_approved
                              ? 'border border-red-500/50 text-red-400 hover:bg-red-500/10'
                              : 'bg-cyan-600 text-white hover:bg-cyan-500'
                          }`}
                        >
                          {u.is_approved ? 'Revoke Access' : 'Approve User'}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!users || users.length === 0) && (
             <div className="p-8 text-center text-zinc-500">
                No users found.
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

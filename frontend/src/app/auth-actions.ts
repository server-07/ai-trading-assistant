'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Clear the bypass cookie if it exists
  const cookieStore = await cookies()
  cookieStore.delete('bypass_auth')

  redirect('/login')
}

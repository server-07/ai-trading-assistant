'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveUser(userId: string, isApproved: boolean) {
  const supabase = await createClient()

  // Verify the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Not authorized')
  }

  // Update the target user's approval status
  const { error } = await supabase
    .from('profiles')
    .update({ is_approved: isApproved })
    .eq('id', userId)

  if (error) {
    throw new Error('Failed to update user status')
  }

  revalidatePath('/admin')
}

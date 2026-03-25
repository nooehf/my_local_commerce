'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function resetPasswordAction(formData: FormData, locale: string) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required' }

  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/${locale}/auth/callback?next=/${locale}/set-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

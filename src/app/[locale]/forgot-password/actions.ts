'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function resetPasswordAction(formData: FormData, locale: string) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required' }

  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`
  
  // Use fixed site URL for production if set, otherwise dynamic origin for tests
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/${locale}/auth/confirm?type=recovery`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

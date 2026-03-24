'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Parse the hash fragment: #access_token=...&refresh_token=...&type=invite
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const type = params.get('type')

    if (!access_token || !refresh_token) {
      // No token in hash — maybe already authenticated, try to go to set-password
      router.replace('/es/set-password')
      return
    }

    // Set the session using the tokens from the email link
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) {
        router.replace('/es/login?message=El enlace ha expirado o ya fue utilizado.')
      } else if (type === 'invite' || type === 'recovery') {
        router.replace('/es/set-password')
      } else {
        router.replace('/es/customer')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 animate-pulse">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <p className="text-slate-600 font-medium">Verificando tu acceso...</p>
      </div>
    </div>
  )
}

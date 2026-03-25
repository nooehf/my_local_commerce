'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params?.locale as string || 'es'
  const supabase = createClient()

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? `/${locale}/dashboard`
      
      console.log('Auth Callback - Code:', code ? 'Present' : 'Missing')
      console.log('Auth Callback - Next:', next)
      console.log('Auth Callback - Hash:', window.location.hash ? 'Present' : 'Missing')

      if (code) {
        // Handle PKCE (code from query)
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Code exchange error:', error)
          router.replace(`/${locale}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
          return
        }
      }

      // The browser client automatically handles tokens in the hash fragment (#access_token=...)
      // once it's initialized. We just need to wait a small moment for it to sync the session
      // or check the session explicitly.
      
      const { data: { session } } = await supabase.auth.getSession()
      
      // If we have a session (either via code exchange or hash fragment), redirect
      if (session) {
        router.replace(next)
      } else {
        // If no session is found after a short bit, it might be an error
        // But let's check if there's a hash in the URL just in case
        if (!window.location.hash && !code) {
           router.replace(`/${locale}/auth/auth-code-error?error=no_session_found`)
        } else {
          // If there is a hash, give it a tiny bit more time to parse
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              router.replace(next)
            } else {
              router.replace(`/${locale}/auth/auth-code-error?error=session_sync_timeout`)
            }
          }, 1500)
        }
      }
    }

    handleAuth()
  }, [searchParams, locale, router, supabase.auth])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 text-sm animate-pulse">Verificando sesión...</p>
      </div>
    </div>
  )
}

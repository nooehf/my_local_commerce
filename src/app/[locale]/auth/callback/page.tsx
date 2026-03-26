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

      // Extract the type from query params (passed by our route handler)
      let type = searchParams.get('type')

      // Parse hash fragment manually to support Supabase Magic Links & Invites
      const hash = window.location.hash
      if (hash && hash.includes('access_token=')) {
        console.log('Auth Callback - Processing Hash Fragment')
        const hashParams = new URLSearchParams(hash.substring(1))
        if (hashParams.get('type')) {
          type = hashParams.get('type')
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Handle invite/recovery specific routing
        if (type === 'recovery' || type === 'invite' || next.includes('set-password')) {
          router.replace(`/${locale}/set-password?uid=${session.user.id}`)
          return
        }
        router.replace(next)
      } else {
        if (!hash && !code) {
           router.replace(`/${locale}/auth/auth-code-error?error=no_session_found`)
        } else {
           // Wait for Supabase client to process the hash automatically
          setTimeout(async () => {
             const { data: { session: retrySession } } = await supabase.auth.getSession()
             if (retrySession) {
               if (type === 'recovery' || type === 'invite' || next.includes('set-password')) {
                 router.replace(`/${locale}/set-password?uid=${retrySession.user.id}`)
               } else {
                 router.replace(next)
               }
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

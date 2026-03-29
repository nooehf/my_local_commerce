'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const supabase = createClient()
  
  // Guard to prevent double execution in React Strict Mode (Dev)
  const isExecuting = useRef(false)

  useEffect(() => {
    if (isExecuting.current) return
    isExecuting.current = true

    const handleAuth = async () => {
      // 1) Contexto básico y normalización de 'next'
      const rawNext = searchParams.get('next')
      const code = searchParams.get('code')
      let type = searchParams.get('type')

      // Normalizamos el parámetro 'next' para evitar vulnerabilidades de Open-Redirect
      // y asegurar que siempre sea una ruta interna válida.
      let next = `/${locale}/dashboard`
      if (rawNext && rawNext.trim() !== '') {
        if (rawNext.startsWith('http') || rawNext.startsWith('//')) {
          // Ignoramos URLs externas completas por seguridad
          next = `/${locale}/dashboard`
        } else {
          // Aseguramos que siempre empiece con una barra /
          next = rawNext.startsWith('/') ? rawNext : `/${rawNext}`
        }
      }

      // 2) PKCE Flow: detection de ?code=...
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('[AUTH-CALLBACK] Code exchange error:', error)
          router.replace(`/${locale}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
          return
        }
      }

      // 3) Implicit Flow: detección de #access_token=...
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        const hashError = hashParams.get('error') || hashParams.get('error_description')
        if (hashError) {
          console.error('[AUTH-CALLBACK] Hash error:', hashError)
          router.replace(`/${locale}/auth/auth-code-error?error=${encodeURIComponent(hashError)}`)
          return
        }

        const hashType = hashParams.get('type')
        if (hashType) type = hashType

        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('[AUTH-CALLBACK] setSession error:', error)
            router.replace(`/${locale}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
            return
          }

          window.history.replaceState(
            {}, 
            document.title, 
            window.location.pathname + window.location.search
          )
        }
      }

      // 4) Confirmación final de la sesión
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('[AUTH-CALLBACK] getSession error:', sessionError)
        router.replace(`/${locale}/auth/auth-code-error?error=${encodeURIComponent(sessionError.message)}`)
        return
      }

      if (!session) {
        console.warn('[AUTH-CALLBACK] No session found after processing')
        router.replace(`/${locale}/auth/auth-code-error?error=no_session_found`)
        return
      }

      // 5) Redirección final
      const isSpecialFlow = type === 'recovery' || type === 'invite' || next.includes('set-password')

      if (isSpecialFlow) {
        router.replace(`/${locale}/set-password?uid=${session.user.id}`)
      } else {
        router.replace(next)
      }
    }

    handleAuth()
  }, [searchParams, locale, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 text-sm animate-pulse">Verificando sesión...</p>
      </div>
    </div>
  )
}

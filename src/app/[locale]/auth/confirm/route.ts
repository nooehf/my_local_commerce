import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  const { locale } = await params

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('code')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('next')

  if (code) {
    // SURGICAL LOGOUT: Manually clear ONLY the session cookie for this project.
    // This removes the Admin session but PRESERVES the PKCE verifier cookie
    // (needed for exchangeCodeForSession).
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const projectRef = supabaseUrl.split('.')[0].split('//')[1]
      const sessionCookieName = `sb-${projectRef}-auth-token`
      const cookieStore = await cookies()
      cookieStore.delete(sessionCookieName)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If we have a type, we might need a specific redirect (like recovery -> set-password)
      if (type === 'recovery' || next.includes('set-password')) {
        redirectTo.pathname = `/${locale}/set-password`
      } else {
        const cleanNext = next.startsWith('/') ? next : `/${next}`
        // Avoid double locale if next already has it
        redirectTo.pathname = cleanNext.startsWith(`/${locale}`) ? cleanNext : `/${locale}${cleanNext}`
      }
      return NextResponse.redirect(redirectTo)
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = `/${locale}/auth/auth-code-error`
  return NextResponse.redirect(redirectTo)
}

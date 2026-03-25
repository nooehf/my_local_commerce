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

  console.log(`[AUTH-CONFIRM] Incoming request: ${request.url}`)
  
  if (code) {
    console.log(`[AUTH-CONFIRM] Code provided: ${code.substring(0, 5)}...`)
    
    // SURGICAL LOGOUT: Manually clear ONLY the session cookie for this project.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const projectRef = supabaseUrl.split('.')[0].split('//')[1]
      const sessionCookieName = `sb-${projectRef}-auth-token`
      console.log(`[AUTH-CONFIRM] Purging session cookie: ${sessionCookieName}`)
      const cookieStore = await cookies()
      cookieStore.delete(sessionCookieName)
    }

    const supabase = await createClient()
    console.log(`[AUTH-CONFIRM] Exchanging code for session...`)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error(`[AUTH-CONFIRM] Exchange ERROR: ${error.message}`)
    } else {
      console.log(`[AUTH-CONFIRM] Exchange SUCCESS for user: ${data.user?.email}`)
      
      // If we have a type, we might need a specific redirect (like recovery -> set-password)
      if (type === 'recovery' || next.includes('set-password')) {
        redirectTo.pathname = `/${locale}/set-password`
      } else {
        const cleanNext = next.startsWith('/') ? next : `/${next}`
        redirectTo.pathname = cleanNext.startsWith(`/${locale}`) ? cleanNext : `/${locale}${cleanNext}`
      }
      
      console.log(`[AUTH-CONFIRM] Redirecting to: ${redirectTo.href}`)
      return NextResponse.redirect(redirectTo)
    }
  } else {
    console.warn(`[AUTH-CONFIRM] NO CODE provided in URL`)
  }

  // return the user to an error page with some instructions
  console.log(`[AUTH-CONFIRM] Falling back to error page`)
  redirectTo.pathname = `/${locale}/auth/auth-code-error`
  return NextResponse.redirect(redirectTo)
}

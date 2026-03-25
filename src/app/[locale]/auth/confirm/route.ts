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
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error(`[AUTH-CONFIRM] Exchange ERROR: ${error.message}`)
    } else {
      console.log(`[AUTH-CONFIRM] Exchange SUCCESS for user: ${data.user?.email}`)
      
      // If we have a type, we might need a specific redirect (like recovery -> set-password)
      if (type === 'recovery' || next.includes('set-password')) {
        redirectTo.pathname = `/${locale}/set-password`
        // 100% GUARANTEE: Pass the UID to verify correct session in the destination page
        if (data.user) redirectTo.searchParams.set('uid', data.user.id)
      } else {
        const cleanNext = next.startsWith('/') ? next : `/${next}`
        redirectTo.pathname = cleanNext.startsWith(`/${locale}`) ? cleanNext : `/${locale}${cleanNext}`
      }
      
      console.log(`[AUTH-CONFIRM] Redirecting to: ${redirectTo.href}`)
      
      const response = NextResponse.redirect(redirectTo)
      const cookieStore = await cookies()
      cookieStore.getAll().forEach(c => {
        // CRITICAL FIX: Explicitly set path to / to ensure the cookie is 
        // sent to /set-password and other localized routes.
        response.cookies.set(c.name, c.value, { ...c, path: '/', sameSite: 'lax', secure: true })
      })
      return response
    }
  } else {
    console.warn(`[AUTH-CONFIRM] NO CODE provided in URL`)
  }

  // return the user to an error page with some instructions
  console.log(`[AUTH-CONFIRM] Falling back to error page`)
  redirectTo.pathname = `/${locale}/auth/auth-code-error`
  return NextResponse.redirect(redirectTo)
}

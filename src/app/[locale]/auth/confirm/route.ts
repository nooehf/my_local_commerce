import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  const { locale } = await params

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('code')
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('next')

  console.log(`[AUTH-CONFIRM] Incoming request: ${request.url}`)
  
  const supabase = await createClient()

  if (token_hash && type) {
    // Handle PKCE email flows (invite, magiclink, recovery)
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (error) {
      console.error(`[AUTH-CONFIRM] Verify OTP ERROR: ${error.message}`)
    } else {
      console.log(`[AUTH-CONFIRM] Verify OTP SUCCESS for user: ${data.user?.email}`)
      
      if (type === 'recovery' || type === 'invite' || next.includes('set-password')) {
        redirectTo.pathname = `/${locale}/set-password`
        if (data.user) redirectTo.searchParams.set('uid', data.user.id)
      } else {
        const cleanNext = next.startsWith('/') ? next : `/${next}`
        redirectTo.pathname = cleanNext.startsWith(`/${locale}`) ? cleanNext : `/${locale}${cleanNext}`
      }
      
      const response = NextResponse.redirect(redirectTo)
      const cookieStore = await cookies()
      cookieStore.getAll().forEach(c => {
        response.cookies.set(c.name, c.value, { ...c, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
      })
      return response
    }
  } else if (code) {
    // Handle standard OAuth or code-based flows
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error(`[AUTH-CONFIRM] Exchange ERROR: ${error.message}`)
    } else {
      console.log(`[AUTH-CONFIRM] Exchange SUCCESS for user: ${data.user?.email}`)
      
      if (type === 'recovery' || type === 'invite' || next.includes('set-password')) {
        redirectTo.pathname = `/${locale}/set-password`
        if (data.user) redirectTo.searchParams.set('uid', data.user.id)
      } else {
        const cleanNext = next.startsWith('/') ? next : `/${next}`
        redirectTo.pathname = cleanNext.startsWith(`/${locale}`) ? cleanNext : `/${locale}${cleanNext}`
      }
      
      const response = NextResponse.redirect(redirectTo)
      const cookieStore = await cookies()
      cookieStore.getAll().forEach(c => {
        response.cookies.set(c.name, c.value, { ...c, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
      })
      return response
    }
  } else {
    // If there is no code or token_hash, it might be a magic link or invitation that sends the token in the hash fragment (#access_token=...)
    // We MUST use a client-side (JS) redirect to preserve the hash fragment, as server-side redirects strip it.
    const callbackUrl = `/${locale}/auth/callback`
    console.warn(`[AUTH-CONFIRM] NO CODE/HASH provided. Client-side redirect to: ${callbackUrl}`)
    
    return new NextResponse(
      `<html>
        <head>
          <script>
            window.location.href = "${callbackUrl}" + window.location.search + window.location.hash;
          </script>
        </head>
        <body>Redirecting to login...</body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Fallback if exchange/verify failed
  console.log(`[AUTH-CONFIRM] Falling back to error page`)
  redirectTo.pathname = `/${locale}/auth/auth-code-error`
  return NextResponse.redirect(redirectTo)
}

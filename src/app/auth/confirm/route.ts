import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'invite' | 'recovery' | 'signup' | 'email' | null
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()

  if (!token_hash || !type) {
    redirectTo.pathname = '/error'
    redirectTo.searchParams.set('message', 'Token de verificación inválido.')
    return NextResponse.redirect(redirectTo)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    redirectTo.pathname = '/es/login'
    redirectTo.searchParams.set('message', 'El enlace ha expirado o ya fue utilizado.')
    return NextResponse.redirect(redirectTo)
  }

  // On success: redirect customer to the set-password page
  redirectTo.pathname = '/es/set-password'
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  return NextResponse.redirect(redirectTo)
}

import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'

/**
 * Root-level auth confirmation route.
 * Handles links from Supabase emails (e.g., reset password) that do NOT have a locale prefix.
 * Redirects to the default locale's version: /[locale]/auth/confirm
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirectTo = request.nextUrl.clone()
  
  // Default to the routing setup (e.g., 'es')
  const locale = routing.defaultLocale
  
  redirectTo.pathname = `/${locale}/auth/confirm`
  
  console.log(`[AUTH-ROOT] Redirecting to locale version: ${redirectTo.pathname}`)
  
  return NextResponse.redirect(redirectTo)
}

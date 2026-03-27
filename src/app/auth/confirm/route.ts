import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'

/**
 * Root-level auth confirmation route.
 * Handles links from Supabase emails (e.g., reset password) that do NOT have a locale prefix.
 * Redirects to the default locale's version: /[locale]/auth/confirm
 */
export async function GET(request: NextRequest) {
  const locale = routing.defaultLocale
  const url = `/${locale}/auth/confirm`
  
  console.log(`[AUTH-ROOT] Client-side redirect to locale version: ${url}`)
  
  // Return a script-based redirect to preserve any # hash fragment from the original URL
  return new NextResponse(
    `<html>
      <head>
        <script>
          window.location.href = "${url}" + window.location.search + window.location.hash;
        </script>
      </head>
      <body>Redirecting to ${locale}...</body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

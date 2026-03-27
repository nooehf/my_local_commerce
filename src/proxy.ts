import { updateSession } from '@/utils/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Include the root
    '/',
    // Include localized paths
    '/(es|en)/:path*',
    // Include auth paths (crucial for redirects)
    '/auth/:path*',
    // Fallback for everything else except static assets
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
}

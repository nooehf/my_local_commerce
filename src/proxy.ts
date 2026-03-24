import { updateSession } from '@/utils/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/',
    '/(es|en)/:path*',
    '/((?!_next|_vercel|auth|.*\\..*).*)'
  ]
}

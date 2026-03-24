import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const handleI18nRouting = createMiddleware(routing)

export async function updateSession(request: NextRequest) {
  // Run i18n routing first
  let response = handleI18nRouting(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = handleI18nRouting(request)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const localeMatch = path.match(/^\/(en|es)/)
  const locale = localeMatch ? `/${localeMatch[1]}` : `/${routing.defaultLocale}`
  const isCustomer = user?.user_metadata?.role === 'customer'

  const isDashboard = path.match(/^\/(en|es)\/dashboard/) || path.startsWith('/dashboard')
  const isCustomerArea = path.match(/^\/(en|es)\/customer/) || path.startsWith('/customer')
  const isAuth = path.match(/^\/(en|es)\/(login|register)/) || path.startsWith('/login') || path.startsWith('/register')
  const isSetPassword = path.match(/^\/(en|es)\/set-password/) || path.startsWith('/set-password')

  // Unauthenticated: protect dashboard and customer area
  if (!user && (isDashboard || isCustomerArea || isSetPassword)) {
    const url = request.nextUrl.clone()
    url.pathname = `${locale}/login`
    return NextResponse.redirect(url)
  }

  // Customer trying to access the owner dashboard → redirect to their profile
  if (user && isCustomer && isDashboard) {
    const url = request.nextUrl.clone()
    url.pathname = `${locale}/customer`
    return NextResponse.redirect(url)
  }

  // Owner trying to access the customer area → redirect to dashboard
  if (user && !isCustomer && isCustomerArea) {
    const url = request.nextUrl.clone()
    url.pathname = `${locale}/dashboard`
    return NextResponse.redirect(url)
  }

  // Logged-in user on login/register → redirect by role
  if (user && isAuth) {
    const url = request.nextUrl.clone()
    url.pathname = isCustomer ? `${locale}/customer` : `${locale}/dashboard`
    return NextResponse.redirect(url)
  }

  return response
}


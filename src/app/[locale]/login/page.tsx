
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import LoginButton from '@/components/auth/LoginButton'

export default async function Login({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ message: string }>
}) {
  const { locale } = await params
  const { message } = await searchParams
  const t = await getTranslations('Login')

  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    // Read locale from next-intl middleware header (available inside Server Actions)
    const headersList = await headers()
    const currentLocale = headersList.get('x-next-intl-locale') ?? 'es'

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect(`/${currentLocale}/login?message=${encodeURIComponent(error.message)}`)
    }

    return redirect(`/${currentLocale}/dashboard`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <Link
          href="/"
          className="inline-flex py-2 px-4 rounded-md no-underline text-slate-600 hover:text-slate-900 flex items-center group text-sm mb-6 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        <form
          className="flex flex-col w-full gap-2"
          action={signIn}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-slate-900">{t('title')}</h2>
          <label className="text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
            {t('email')}
          </label>
          <input
            className="rounded-lg px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-4"
            name="email"
            placeholder={t('emailPlaceholder')}
            required
          />
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="password">
              {t('password')}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <input
            className="rounded-lg px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-6"
            type="password"
            name="password"
            placeholder={t('passwordPlaceholder')}
            required
          />
          <LoginButton />
          {message && (
            <div 
              className={`mt-4 p-4 text-center text-sm border-l-4 rounded ${
                message.toLowerCase().includes('error') || 
                message.toLowerCase().includes('could not') || 
                message.toLowerCase().includes('invalid') ||
                message.toLowerCase().includes('not found')
                  ? 'bg-red-50 text-red-700 border-red-500' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-500'
              }`}
            >
              {message}
            </div>
          )}
          <div className="mt-4 text-center text-sm text-slate-600">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
              {t('registerHere')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

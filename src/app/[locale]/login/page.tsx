
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams
  const t = await getTranslations('Login')

  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/dashboard')
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
          <label className="text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
            {t('password')}
          </label>
          <input
            className="rounded-lg px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-6"
            type="password"
            name="password"
            placeholder={t('passwordPlaceholder')}
            required
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-3 text-white font-semibold mb-4 transition-colors">
            {t('signIn')}
          </button>
          {message && (
            <p className="mt-4 p-4 bg-red-100 text-red-600 text-center text-sm border-l-4 border-red-500 rounded">
              {message}
            </p>
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

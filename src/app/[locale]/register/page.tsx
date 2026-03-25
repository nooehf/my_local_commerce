
import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export default async function Register({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ message: string }>
}) {
  const { locale } = await params
  const { message } = await searchParams
  const t = await getTranslations('Register')

  const signUp = async (formData: FormData) => {
    'use server'

    const origin = (await headers()).get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const businessName = formData.get('business_name') as string
    const fullName = formData.get('full_name') as string
    
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/${locale}/auth/callback`,
        data: {
          full_name: fullName,
          business_name: businessName,
          locale,
        }
      },
    })

    if (error) {
      return redirect(`/${locale}/register?message=${error.message}`)
    }

    // No llamar a signOut() aquí, ya que borraría la cookie del verificador PKCE necesaria para el email

    const successMessage = locale === 'es' 
      ? 'Cuenta creada con éxito. Revisa tu bandeja de entrada (email) para verificar tu cuenta antes de iniciar sesión.'
      : 'Account created successfully. Please check your inbox to verify your account before logging in.'

    return redirect(`/${locale}/login?message=${successMessage}`)
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
          action={signUp}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-slate-900">{t('title')}</h2>
          
          <label className="text-sm font-semibold text-slate-700 mb-2" htmlFor="full_name">{t('fullName')}</label>
          <input className="rounded-lg px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-4" name="full_name" placeholder={t('fullNamePlaceholder')} required />

          <label className="text-sm font-semibold text-slate-700 mb-2" htmlFor="business_name">{t('businessName')}</label>
          <input className="rounded-lg px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-4" name="business_name" placeholder={t('businessNamePlaceholder')} required />

          <label className="text-sm font-semibold text-slate-700 mb-2" htmlFor="email">{t('email')}</label>
          <input className="rounded-lg px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-4" name="email" placeholder={t('emailPlaceholder')} required />
      
          <label className="text-sm font-semibold text-slate-700 mb-2" htmlFor="password">{t('password')}</label>
          <input className="rounded-lg px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-6" type="password" name="password" placeholder={t('passwordPlaceholder')} required />
      
          <button className="bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-3 text-white font-semibold mb-4 transition-colors">
            {t('signUp')}
          </button>
          {message && (
            <div 
              className={`mt-4 p-4 text-center text-sm border-l-4 rounded ${
                message.toLowerCase().includes('error') || message.toLowerCase().includes('already') || message.toLowerCase().includes('invalid')
                  ? 'bg-red-50 text-red-700 border-red-500' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-500'
              }`}
            >
              {message}
            </div>
          )}
          <div className="mt-4 text-center text-sm text-slate-600">
            {t('alreadyAccount')}{' '}
            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
              {t('signInHere')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

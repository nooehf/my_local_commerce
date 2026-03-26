import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import SubmitButton from '@/components/ui/SubmitButton'
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'

export default async function Register({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ message?: string; error?: string; success?: string; email?: string }>
}) {
  const { locale } = await params
  const { message, error, success, email: savedEmail } = await searchParams
  const t = await getTranslations('Register')

  const signUp = async (formData: FormData) => {
    'use server'

    const origin = (await headers()).get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const businessName = formData.get('business_name') as string
    const fullName = formData.get('full_name') as string
    
    const supabase = await createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/${locale}/auth/confirm?next=/${locale}/dashboard`,
        data: {
          full_name: fullName,
          business_name: businessName,
          locale,
        }
      },
    })

    if (authError) {
      return redirect(`/${locale}/register?error=${encodeURIComponent(authError.message)}`)
    }

    // Redirect to the same page but showing success screen
    return redirect(`/${locale}/register?success=true&email=${encodeURIComponent(email)}`)
  }

  const resendEmail = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const origin = (await headers()).get('origin')
    const supabase = await createClient()

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${origin}/${locale}/auth/confirm?next=/${locale}/dashboard`,
      }
    })

    if (resendError) {
       return redirect(`/${locale}/register?success=true&email=${encodeURIComponent(email)}&error=${encodeURIComponent(resendError.message)}`)
    }

    const successMsg = locale === 'es' ? 'Email reenviado correctamente. Revisa también tu carpeta de SPAM.' : 'Email resent successfully. Please also check your SPAM folder.'
    return redirect(`/${locale}/register?success=true&email=${encodeURIComponent(email)}&message=${encodeURIComponent(successMsg)}`)
  }

  if (success === 'true' && savedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {locale === 'es' ? 'Revisa tu correo' : 'Check your email'}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {locale === 'es' 
              ? `Hemos enviado un enlace de confirmación a ` 
              : `We've sent a confirmation link to `}
            <span className="font-semibold text-slate-900">{decodeURIComponent(savedEmail)}</span>.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex items-start text-left gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              {locale === 'es' 
                ? 'Si no lo encuentras en unos minutos, por favor revisa tu carpeta de Correo no deseado (SPAM).' 
                : 'If you don\'t see it in a few minutes, please check your SPAM or junk mail folder.'}
            </p>
          </div>

          {message && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm border border-emerald-200">
              {decodeURIComponent(message)}
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-lg text-sm border border-rose-200">
              {decodeURIComponent(error)}
            </div>
          )}

          <div className="pt-4 flex flex-col gap-3">
            <form action={resendEmail}>
              <input type="hidden" name="email" value={decodeURIComponent(savedEmail)} />
              <SubmitButton 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-none hover:shadow-none ring-1 ring-slate-200"
                loadingText={locale === 'es' ? "Reenviando..." : "Resending..."}
              >
                {locale === 'es' ? 'Volver a enviar email' : 'Resend email'}
              </SubmitButton>
            </form>
            <Link
              href="/login"
              className="inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {locale === 'es' ? 'Ir a Iniciar Sesión' : 'Go to Login'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <Link
          href="/"
          className="inline-flex py-2 px-4 rounded-md no-underline text-slate-600 hover:text-slate-900 flex items-center group text-sm mb-6 font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
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
      
          <SubmitButton
            className="w-full mb-4"
            loadingText={locale === 'es' ? 'Creando cuenta...' : 'Creating account...'}
          >
            {t('signUp')}
          </SubmitButton>

          {error && (
            <div className={`mt-4 p-4 text-center text-sm border-l-4 rounded bg-red-50 text-red-700 border-red-500`}>
              {decodeURIComponent(error)}
            </div>
          )}

          {message && !error && (
            <div className={`mt-4 p-4 text-center text-sm border-l-4 rounded bg-emerald-50 text-emerald-700 border-emerald-500`}>
              {decodeURIComponent(message)}
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

'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import SubmitButton from '@/components/ui/SubmitButton'
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle, KeyRound, Eye, EyeOff, User, Building } from 'lucide-react'
import { useState } from 'react'

export default function Register() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = (params?.locale as string) || 'es'
  
  const message = searchParams.get('message')
  const errorParam = searchParams.get('error')
  const success = searchParams.get('success')
  const savedEmail = searchParams.get('email')
  
  const t = useTranslations('Register')
  
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const signUp = async (formData: FormData) => {
    setLocalError(null)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const businessName = formData.get('business_name') as string
    const fullName = formData.get('full_name') as string

    if (password.length < 8) {
      setLocalError(locale === 'es' ? 'La contraseña debe tener al menos 8 caracteres.' : 'Password must be at least 8 characters.')
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/auth/confirm?next=/${locale}/dashboard`,
        data: {
          full_name: fullName,
          business_name: businessName,
          locale,
        }
      },
    })

    if (authError) {
      router.push(`/${locale}/register?error=${encodeURIComponent(authError.message)}`)
      return
    }

    router.push(`/${locale}/register?success=true&email=${encodeURIComponent(email)}`)
  }

  const resendEmail = async (formData: FormData) => {
    const email = formData.get('email') as string
    const supabase = createClient()

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/auth/confirm?next=/${locale}/dashboard`,
      }
    })

    if (resendError) {
       router.push(`/${locale}/register?success=true&email=${encodeURIComponent(email)}&error=${encodeURIComponent(resendError.message)}`)
       return
    }

    const successMsg = locale === 'es' ? 'Email reenviado correctamente. Revisa también tu carpeta de SPAM.' : 'Email resent successfully. Please also check your SPAM folder.'
    router.push(`/${locale}/register?success=true&email=${encodeURIComponent(email)}&message=${encodeURIComponent(successMsg)}`)
  }

  const inputClass = "block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-slate-50/50 transition-all"
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2"

  if (success === 'true' && savedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4">
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

          {(message || errorParam) && (
            <div className={`p-3 rounded-lg text-sm border ${errorParam ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {decodeURIComponent((message || errorParam) as string)}
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <Link
          href="/"
          className="inline-flex py-2 px-4 rounded-md no-underline text-slate-600 hover:text-slate-900 flex items-center group text-sm mb-6 font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {locale === 'es' ? 'Volver' : 'Back'}
        </Link>

        <form
          className="flex flex-col w-full gap-5"
          action={signUp}
        >
          <h2 className="text-3xl font-bold mb-2 text-center text-slate-900">{t('title')}</h2>
          <p className="text-center text-slate-500 text-sm mb-4">Crea tu cuenta profesional ahora</p>
          
          <div>
            <label className={labelClass} htmlFor="full_name">{t('fullName')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input className={`${inputClass} pl-11`} name="full_name" placeholder={t('fullNamePlaceholder')} required />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="business_name">{t('businessName')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Building className="w-4 h-4 text-slate-400" />
              </div>
              <input className={`${inputClass} pl-11`} name="business_name" placeholder={t('businessNamePlaceholder')} required />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="email">{t('email')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input className={`${inputClass} pl-11`} name="email" type="email" placeholder={t('emailPlaceholder')} required />
            </div>
          </div>
      
          <div>
            <label className={labelClass} htmlFor="password">{t('password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <KeyRound className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                className={`${inputClass} pl-11 pr-11`} 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                placeholder={t('passwordPlaceholder')} 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Mínimo 8 caracteres</p>
          </div>
      
          {(errorParam || localError) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {localError || decodeURIComponent(errorParam as string)}
            </div>
          )}

          <SubmitButton
            className="w-full mt-2"
            loadingText={locale === 'es' ? 'Creando cuenta...' : 'Creating account...'}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {t('signUp')}
          </SubmitButton>
          
          <div className="text-center text-sm text-slate-600">
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

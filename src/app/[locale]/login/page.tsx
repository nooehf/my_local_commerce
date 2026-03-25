
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { ShoppingBag, ChevronLeft } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'



async function signIn(formData: FormData) {
  'use server'

  const email = (formData.get('email') as string)?.trim() || ''
  const password = (formData.get('password') as string) || ''
  const supabase = await createClient()

  // Diagnostic log for Netlify (visible in Functions logs)
  console.log(`[AUTH] Login attempt for: ${email.substring(0, 3)}... (Total length: ${email.length})`)
  if (email.length === 0) console.warn('[AUTH] WARNING: Email is EMPTY in server action!')

  const headersList = await headers()
  const currentLocale = headersList.get('x-next-intl-locale') ?? 'es'

  const { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  })

  if (error) {
    console.error(`[AUTH] Error for ${email}:`, error.message)
    const debugInfo = email ? ` (Recibido: ${email.substring(0,2)}...${email.length} caracteres)` : ' (Email vacío)'
    return redirect(`/${currentLocale}/login?message=${encodeURIComponent(error.message + debugInfo)}`)
  }

  return redirect(`/${currentLocale}/dashboard`)
}

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

  const translations = {
    email: t('email'),
    emailPlaceholder: t('emailPlaceholder'),
    password: t('password'),
    passwordPlaceholder: t('passwordPlaceholder'),
    forgotPassword: t('forgotPassword'),
    noAccount: t('noAccount'),
    registerHere: t('registerHere'),
    title: t('title'),
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <Link
          href="/"
          className="inline-flex py-2 px-4 rounded-md no-underline text-slate-600 hover:text-slate-900 flex items-center group text-sm mb-6 font-medium"
        >
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <LoginForm 
          signInAction={signIn} 
          translations={translations} 
          message={message} 
        />
      </div>
    </div>
  )
}

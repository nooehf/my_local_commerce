'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { resetPasswordAction } from './actions'

export default function ForgotPasswordPage() {
  const { locale } = useParams() as { locale: string }
  const t = useTranslations('ForgotPassword')
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await resetPasswordAction(formData, locale)

    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 p-8">
          {success ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('successMessage')}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t('emailPlaceholder')}
                    className="block w-full rounded-xl border-0 py-3 pl-11 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-slate-50/50 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 animate-in fade-in duration-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('submit')}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('backToLogin')}
                </Link>
              </div>
            </form>
          )}
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8 uppercase tracking-widest font-medium">
          My Local Commerce
        </p>
      </div>
    </div>
  )
}

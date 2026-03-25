import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { AlertTriangle, Home } from 'lucide-react'

export default async function AuthCodeError({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { locale } = await params
  const { error } = await searchParams
  const t = await getTranslations('AuthError')

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-500 text-sm">
            {t('description')}
          </p>
          {error && (
            <code className="block mt-2 text-[10px] text-slate-400 font-mono">
              Error code: {error}
            </code>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm text-slate-600 text-left">
          <p className="font-semibold mb-1">{t('whatToDo')}</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
          </ul>
        </div>

        <div className="pt-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            {t('backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}

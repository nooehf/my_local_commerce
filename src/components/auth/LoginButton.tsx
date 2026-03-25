'use client'

import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

export default function LoginButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Login')

  return (
    <button 
      type="submit"
      disabled={pending}
      className={`w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-3 text-white font-semibold mb-4 transition-all flex items-center justify-center gap-2 ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending && (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span>{pending ? (t('signIn') + '...') : t('signIn')}</span>
    </button>
  )
}

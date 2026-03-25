'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import LoginButton from '@/components/auth/LoginButton'

interface LoginFormProps {
  signInAction: (formData: FormData) => Promise<void>
  translations: {
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
    forgotPassword: string
    noAccount: string
    registerHere: string
    title: string
  }
  message?: string
}

export default function LoginForm({ signInAction, translations, message }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form
      className="flex flex-col w-full gap-2"
      action={signInAction}
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-slate-900">{translations.title}</h2>
      
      <label className="text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
        {translations.email}
      </label>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-4 w-4 text-slate-400" />
        </div>
        <input
          className="rounded-lg px-4 py-2 pl-10 w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-slate-400 text-slate-900"
          name="email"
          type="email"
          placeholder={translations.emailPlaceholder}
          required
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          {translations.password}
        </label>
        <Link
          href="/forgot-password"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {translations.forgotPassword}
        </Link>
      </div>
      
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-slate-400" />
        </div>
        <input
          className="rounded-lg px-4 py-2 pl-10 pr-10 w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-slate-400 text-slate-900"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder={translations.passwordPlaceholder}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

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
        {translations.noAccount}{' '}
        <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
          {translations.registerHere}
        </Link>
      </div>
    </form>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/ui/LogoutButton'
import { User, Mail, Star, Shield } from 'lucide-react'

export default async function CustomerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/es/login')
  }

  // If somehow an owner lands here, send them to the dashboard
  if (user.user_metadata?.role !== 'customer') {
    redirect('/es/dashboard')
  }

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente'
  const firstName = user.user_metadata?.first_name || fullName
  const email = user.email || ''
  const points = 0 // Future: fetch from DB

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col">

      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-sm">Mi Cuenta</span>
        </div>
        <LogoutButton />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-5">

          {/* Welcome card */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200/60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-indigo-200 text-sm font-medium">Bienvenido/a</p>
                <h1 className="text-xl font-bold">{fullName}</h1>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 gap-4">

            {/* Email */}
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Correo electrónico</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{email}</p>
              </div>
            </div>

            {/* Points */}
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Puntos acumulados</p>
                <p className="text-2xl font-bold text-slate-900">{points} <span className="text-sm font-medium text-slate-400">pts</span></p>
              </div>
            </div>

            {/* Account info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Tipo de cuenta</p>
                <p className="text-sm font-semibold text-slate-900">Cliente</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

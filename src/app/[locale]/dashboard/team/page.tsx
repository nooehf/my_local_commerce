import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { Plus, UsersRound, Mail, ChevronRight } from 'lucide-react'
import { getTeamMembers } from '@/lib/team/actions'

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('Team')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect({ href: '/login', locale: locale })

  // Admin Guard (Strict: admin or super_admin allowed)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return redirect({ href: '/dashboard', locale })
  }

  // Fetch team members using the server action (which validates business_id and role)
  const { data: employees, error: fetchError } = await getTeamMembers()

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          {fetchError}
        </div>
      )}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
          <p className="mt-2 text-sm text-slate-600 italic">
            {t('subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <Link
            href="/dashboard/team/new"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
            {t('newEmployee')}
          </Link>
        </div>
      </div>

      {!employees || employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 mt-6 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <UsersRound className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('noEmployees')}</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-xs px-4">
            {t('noEmployeesDesc')}
          </p>
          <Link
            href="/dashboard/team/new"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Plus className="h-4 w-4" />
            {t('firstInvite')}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('name')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('status')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 hidden md:table-cell">{t('email')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {employee.photo_url ? (
                          <img src={employee.photo_url} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {(employee.first_name || employee.name)?.[0] || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{employee.first_name || employee.name} {employee.last_name || ''}</p>
                          <p className="text-xs text-slate-500">{employee.position || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                        employee.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                          : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                      }`}>
                        {employee.status === 'active' ? t('active') : t('invited')}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500 group-hover:text-slate-900 transition-colors">
                      <div className="flex items-center gap-2 max-w-[200px] truncate">
                        <Mail className="w-3.5 h-3.5 opacity-40 shrink-0" />
                        {employee.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/team/${employee.id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-all group-hover:translate-x-0.5 active:scale-95"
                      >
                        {t('details')}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

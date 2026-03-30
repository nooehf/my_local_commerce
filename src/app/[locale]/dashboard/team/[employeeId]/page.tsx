import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { ChevronLeft, Mail, Phone, Briefcase, Clock } from 'lucide-react'
import { getEmployeeDetail } from '@/lib/team/actions'
import ServicesTab from './components/ServicesTab'
import ShiftsTab from './components/ShiftsTab'

export default async function EmployeeDetailPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string, employeeId: string }>,
  searchParams: Promise<{ tab?: string }>
}) {
  const { locale, employeeId } = await params
  const { tab = 'services' } = await searchParams
  const t = await getTranslations('Team')

  // -- DEFENSIVE GUARD: Validate UUID --
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!employeeId || employeeId === 'undefined' || !uuidRegex.test(employeeId)) {
    console.error(`[TEAM] Invalid employeeId detected: "${employeeId}". Redirecting...`)
    return redirect({ href: '/dashboard/team', locale })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect({ href: '/login', locale })

  // Admin Guard (Strict)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return redirect({ href: '/dashboard', locale })
  }

  const { data: employee, error: fetchError } = await getEmployeeDetail(employeeId)
  
  if (fetchError) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 font-medium">
        {fetchError}
      </div>
    )
  }

  if (!employee) return notFound()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      {/* Breadcrumbs / Back */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/${locale}/dashboard/team`}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 flex items-center justify-center border border-slate-200 active:scale-95"
          title="Volver"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{employee.first_name || employee.name} {employee.last_name || ''}</h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{employee.position || t('worker')}</p>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start md:items-center">
        {employee.photo_url ? (
          <img src={employee.photo_url} alt="" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-sm" />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-3xl shadow-sm ring-4 ring-indigo-50 uppercase">
            {(employee.first_name || employee.name)?.[0] || '?'}
          </div>
        )}
        
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('status')}</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${employee.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-sm font-semibold text-slate-700">{employee.status === 'active' ? t('active') : t('invited')}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('email')}</span>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 truncate">
              <Mail className="w-4 h-4 opacity-40 shrink-0" />
              <span className="truncate">{employee.email || '-'}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('phone')}</span>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Phone className="w-4 h-4 opacity-40 shrink-0" />
              {employee.phone || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit self-start shadow-inner">
          <Link
            href={`?tab=services`}
            scroll={false}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              tab === 'services' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            {t('tabs.services')}
          </Link>
          <Link
            href={`?tab=shifts`}
            scroll={false}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              tab === 'shifts' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            {t('tabs.shifts')}
          </Link>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in zoom-in-95 duration-300">
          {tab === 'services' ? (
            <ServicesTab employeeId={employeeId} locale={locale} />
          ) : (
            <ShiftsTab employeeId={employeeId} locale={locale} />
          )}
        </div>
      </div>
    </div>
  )
}

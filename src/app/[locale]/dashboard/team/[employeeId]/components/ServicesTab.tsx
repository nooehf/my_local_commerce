import { getServicesAction, getEmployeeSkillsAction } from '@/lib/team/actions'
import ServicesList from '@/app/[locale]/dashboard/team/[employeeId]/components/ServicesList'
import { getTranslations } from 'next-intl/server'

export default async function ServicesTab({ 
  employeeId, 
  locale 
}: { 
  employeeId: string, 
  locale: string 
}) {
  const t = await getTranslations('Team.servicesTab')
  const [servicesRes, skillsRes] = await Promise.all([
    getServicesAction(),
    getEmployeeSkillsAction(employeeId)
  ])

  const fetchError = servicesRes.error || skillsRes.error
  const allServices = servicesRes.data || []
  const employeeSkills = skillsRes.data || []

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {fetchError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-700 text-sm font-medium">
          {fetchError}
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900">{t('title')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
      </div>

      <ServicesList 
        employeeId={employeeId}
        allServices={allServices || []}
        employeeSkills={employeeSkills || []}
        locale={locale}
      />
    </div>
  )
}

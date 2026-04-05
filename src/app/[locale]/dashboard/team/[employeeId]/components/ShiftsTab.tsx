import { getEmployeeScheduleAction } from '@/lib/settings/employeeActions'
import { getBusinessHoursAction, getBusinessExceptionsAction } from '@/lib/settings/actions'
import EmployeeHoursForm from '@/components/dashboard/EmployeeHoursForm'
import EmployeeScheduleModal from '@/components/dashboard/EmployeeScheduleModal'
import { getTranslations } from 'next-intl/server'
import { Clock } from 'lucide-react'

export default async function ShiftsTab({ 
  employeeId, 
  locale 
}: { 
  employeeId: string, 
  locale: string 
}) {
  const t = await getTranslations('Team.shiftsTab')
  
  // Fetch everything needed for validation and display
  const [employeeSched, bizHours, bizEx] = await Promise.all([
    getEmployeeScheduleAction(employeeId),
    getBusinessHoursAction(),
    getBusinessExceptionsAction()
  ])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-500" />
              {t('title')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
          </div>
          <EmployeeScheduleModal 
            standardHours={employeeSched.hours || []}
            exceptions={employeeSched.exceptions || []}
            businessHours={bizHours.data || []}
            businessExceptions={bizEx.data || []}
            locale={locale}
          />
        </div>

        {employeeSched.error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-700 text-sm font-medium">
            {employeeSched.error}
          </div>
        )}

        <EmployeeHoursForm 
          employeeId={employeeId}
          initialHours={employeeSched.hours || []}
          initialExceptions={employeeSched.exceptions || []}
          businessHours={bizHours.data || []}
          businessExceptions={bizEx.data || []}
          locale={locale}
        />
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Clock, CalendarIcon, UsersRound } from 'lucide-react'

export default async function ShiftsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: shifts } = await supabase
    .from('staff_shifts')
    .select('id, date, start_time, end_time, employees(id, profile_id, profiles(name))')
    .eq('business_id', profile?.business_id || '')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Turnos</h1>
          <p className="mt-2 text-sm text-slate-700">
            Planifica los horarios de trabajo de tu equipo.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/shifts/new"
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Asignar Turno
          </Link>
        </div>
      </div>

      {!shifts || shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <CalendarIcon className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Sin turnos programados</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Asigna turnos a tu equipo para tener el control de los horarios de trabajo.
          </p>
          <Link
            href="/dashboard/shifts/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Asignar primer turno
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-medium text-slate-900">Próximos Turnos</h2>
          </div>
          <ul role="list" className="divide-y divide-slate-100 p-6">
            {shifts.map((shift) => {
              const employee = shift.employees as any
              const employeeName = employee?.profiles?.name || 'Sin nombre'
              return (
                <li key={shift.id} className="flex items-center justify-between gap-x-6 py-5">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="h-12 w-12 flex-none rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold uppercase">
                      {employeeName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-slate-900">{employeeName}</p>
                      <p className="mt-1 flex text-xs leading-5 text-slate-500 items-center">
                        <CalendarIcon className="mr-1 h-4 w-4 text-slate-400" />
                        {shift.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-x-4">
                    <p className="text-sm text-slate-700 flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-slate-400" />
                      {shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

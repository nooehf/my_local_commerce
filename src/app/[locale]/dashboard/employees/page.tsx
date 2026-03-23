import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Mail, Briefcase, UsersRound, Phone } from 'lucide-react'

export default async function EmployeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: employees } = await supabase
    .from('employees')
    .select('id, name, email, phone, position, status')
    .eq('business_id', profile?.business_id || '')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Empleados</h1>
          <p className="mt-2 text-sm text-slate-700">
            Gestiona tu equipo, sus roles y accesos a la plataforma.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <Link
            href="/dashboard/employees/new"
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo Empleado
          </Link>
        </div>
      </div>

      {!employees || employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <UsersRound className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Sin empleados aún</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Empieza añadiendo a los miembros de tu equipo para gestionar sus turnos y tareas.
          </p>
          <Link
            href="/dashboard/employees/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Añadir primer empleado
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {employees.map((employee) => (
            <div key={employee.id} className="col-span-1 flex flex-col divide-y divide-slate-200 rounded-xl bg-white text-center shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="flex flex-1 flex-col p-8">
                <div className="mx-auto h-20 w-20 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-semibold text-indigo-600 uppercase">
                  {employee.name?.charAt(0) || '?'}
                </div>
                <h3 className="mt-6 text-sm font-semibold text-slate-900">{employee.name}</h3>
                {employee.position && (
                  <p className="text-xs text-slate-500 mt-1">{employee.position}</p>
                )}
                <div className="mt-3 flex flex-col gap-1.5 items-center">
                  {employee.email && (
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />{employee.email}
                    </span>
                  )}
                  {employee.phone && (
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />{employee.phone}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    employee.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {employee.status === 'active' ? 'Activo' : employee.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

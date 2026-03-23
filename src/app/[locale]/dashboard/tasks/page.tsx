import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, CheckSquare, Clock, ClipboardList } from 'lucide-react'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, description, due_date, status, employees(id, profiles(name))')
    .eq('business_id', profile?.business_id || '')
    .order('due_date', { ascending: true })

  const pending = tasks?.filter((t) => t.status !== 'completed') ?? []
  const completed = tasks?.filter((t) => t.status === 'completed') ?? []

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Tareas</h1>
          <p className="mt-2 text-sm text-slate-700">
            Asigna tareas diarias al equipo y haz seguimiento de su finalización.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/tasks/new"
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nueva Tarea
          </Link>
        </div>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Sin tareas creadas</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Crea tareas y asígnalas a tu equipo para organizar el día a día del negocio.
          </p>
          <Link
            href="/dashboard/tasks/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Crear primera tarea
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 col-span-1 lg:col-span-2">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-medium text-slate-900">Tareas Pendientes ({pending.length})</h2>
            </div>
            {pending.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">¡Todo al día! No hay tareas pendientes.</div>
            ) : (
              <ul className="divide-y divide-slate-100 p-6 space-y-3">
                {pending.map((task) => {
                  const employee = task.employees as any
                  const assigneeName = employee?.profiles?.name
                  return (
                    <li key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="h-6 w-6 rounded border border-slate-300 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{task.title}</span>
                          {assigneeName && (
                            <span className="text-xs text-slate-500 mt-0.5">Asignado a: {assigneeName}</span>
                          )}
                        </div>
                      </div>
                      {task.due_date && (
                        <span className="text-xs flex items-center text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md shrink-0">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {task.due_date}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-medium text-slate-900">Completadas ({completed.length})</h2>
            </div>
            {completed.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">Aún no hay tareas completadas.</div>
            ) : (
              <ul className="divide-y divide-slate-100 p-6 space-y-3">
                {completed.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 opacity-75">
                    <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-900 line-through decoration-slate-400">{task.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

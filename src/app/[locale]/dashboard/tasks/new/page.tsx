import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewTaskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: employees } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('business_id', profile?.business_id || '')
    .in('role', ['employee', 'admin'])

  const createTask = async (formData: FormData) => {
    'use server'
    const headersList = await headers()
    const currentLocale = headersList.get('x-next-intl-locale') ?? 'es'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect(`/${currentLocale}/login`)

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .eq('id', user.id)
      .single()

    if (!profile?.business_id) return redirect(`/${currentLocale}/dashboard/tasks`)

    const assigned_profile_id = formData.get('assigned_to') as string
    let employee_id: string | null = null

    if (assigned_profile_id) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('profile_id', assigned_profile_id)
        .single()
      employee_id = employee?.id || null
    }

    const { error } = await supabase.from('tasks').insert({
      business_id: profile.business_id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assigned_to: employee_id,
      due_date: formData.get('due_date') as string || null,
      status: 'pending',
    })

    if (!error) redirect(`/${currentLocale}/dashboard/tasks`)
    redirect(`/${currentLocale}/dashboard/tasks/new?error=${error.message}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/tasks" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva Tarea</h1>
          <p className="text-sm text-slate-500 mt-0.5">Crea y asigna una tarea a tu equipo</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <form action={createTask} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="Limpiar la sala de espera"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detalles adicionales sobre la tarea..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Asignar a
              </label>
              <select
                name="assigned_to"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Sin asignar</option>
                {employees?.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha límite
              </label>
              <input
                name="due_date"
                type="date"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/dashboard/tasks"
              className="flex-1 text-center px-6 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              Crear Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewShiftPage() {
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
    .eq('role', 'employee')

  const createShift = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .eq('id', user.id)
      .single()

    if (!profile?.business_id) return redirect('/dashboard/shifts')

    // Find employee record linked to profile
    const employee_profile_id = formData.get('employee_id') as string
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('profile_id', employee_profile_id)
      .single()

    const { error } = await supabase.from('staff_shifts').insert({
      business_id: profile.business_id,
      employee_id: employee?.id,
      date: formData.get('date') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
    })

    if (!error) redirect('/dashboard/shifts')
    redirect(`/dashboard/shifts/new?error=${error.message}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/shifts" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Turno</h1>
          <p className="text-sm text-slate-500 mt-0.5">Programa un turno de trabajo</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <form action={createShift} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Empleado <span className="text-red-500">*</span>
            </label>
            <select
              name="employee_id"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecciona un empleado</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                name="date"
                type="date"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora de Entrada <span className="text-red-500">*</span>
              </label>
              <input
                name="start_time"
                type="time"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora de Salida <span className="text-red-500">*</span>
              </label>
              <input
                name="end_time"
                type="time"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/dashboard/shifts"
              className="flex-1 text-center px-6 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              Crear Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

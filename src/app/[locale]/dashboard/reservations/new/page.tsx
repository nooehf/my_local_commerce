import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = profile?.business_id
  if (!businessId) return redirect('/dashboard/reservations')

  // Fetch real data
  const [
    { data: customers },
    { data: services },
    { data: employees }
  ] = await Promise.all([
    supabase.from('customers').select('id, first_name, last_name, phone').eq('business_id', businessId).order('first_name'),
    supabase.from('services').select('id, name, duration_minutes, price').eq('business_id', businessId).eq('active', true).order('name'),
    supabase.from('employees').select('id, name, position').eq('business_id', businessId).eq('status', 'active').order('name')
  ])

  const createReservation = async (formData: FormData) => {
    'use server'
    const headersList = await headers()
    const currentLocale = headersList.get('x-next-intl-locale') ?? 'es'

    const supabaseAction = await createClient()
    const { data: { user: userAction } } = await supabaseAction.auth.getUser()
    if (!userAction) return redirect(`/${currentLocale}/login`)

    const customerId = formData.get('customer_id') as string
    const serviceId = formData.get('service_id') as string
    const employeeId = formData.get('employee_id') as string
    const reservationDate = formData.get('date') as string
    const startTime = formData.get('time') as string
    const notes = formData.get('notes') as string

    // Fetch service for duration
    const { data: selectedService } = await supabaseAction
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single()

    if (!selectedService) {
      return redirect(`/${currentLocale}/dashboard/reservations/new?error=${encodeURIComponent('Servicio no encontrado')}`)
    }

    // Calculate end_time
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDate = new Date(2000, 0, 1, hours, minutes)
    const endDate = new Date(startDate.getTime() + selectedService.duration_minutes * 60000)
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

    const { error } = await supabaseAction.from('reservations').insert({
      business_id: businessId,
      customer_id: customerId,
      service_id: serviceId,
      employee_id: employeeId || null,
      reservation_date: reservationDate,
      start_time: startTime,
      end_time: endTime,
      status: 'pending',
      notes: notes || null,
    })

    if (error) {
      return redirect(`/${currentLocale}/dashboard/reservations/new?error=${encodeURIComponent(error.message)}`)
    }

    redirect(`/${currentLocale}/dashboard/reservations`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 lg:mt-8">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/dashboard/reservations" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Crear Reserva</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Error: {decodeURIComponent(error)}
        </div>
      )}

      <form action={createReservation} className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8 space-y-8">
          
          {/* Customer Selection */}
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">Cliente</h2>
            <div className="mt-4">
              <label htmlFor="customer_id" className="block text-sm font-medium leading-6 text-slate-900">
                Seleccionar Cliente <span className="text-red-500">*</span>
              </label>
              <select 
                name="customer_id" 
                id="customer_id" 
                required
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Buscar cliente...</option>
                {customers?.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
              <div className="mt-2 text-xs text-slate-500">
                ¿No encuentras al cliente? <Link href="/dashboard/customers/new" className="text-indigo-600 font-medium hover:text-indigo-500">Crear Nuevo Cliente</Link>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Service & Employee Selection */}
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">Detalles del Servicio</h2>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div>
                <label htmlFor="service_id" className="block text-sm font-medium leading-6 text-slate-900">
                  Servicio <span className="text-red-500">*</span>
                </label>
                <select 
                  name="service_id" 
                  id="service_id" 
                  required
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Seleccionar servicio</option>
                  {services?.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="employee_id" className="block text-sm font-medium leading-6 text-slate-900">
                  Empleado
                </label>
                <select 
                  name="employee_id" 
                  id="employee_id"
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Cualquier empleado</option>
                  {employees?.map(e => (
                    <option key={e.id} value={e.id}>{e.name} {e.position ? `- ${e.position}` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Date & Time */}
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">Fecha y Hora</h2>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium leading-6 text-slate-900">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input 
                  name="date"
                  type="date" 
                  id="date"
                  required
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium leading-6 text-slate-900">
                  Hora <span className="text-red-500">*</span>
                </label>
                <input 
                  name="time"
                  type="time" 
                  id="time"
                  required
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                />
              </div>
            </div>
          </div>

          <div>
             <label htmlFor="notes" className="block text-sm font-medium leading-6 text-slate-900">
                Notas adicionales
             </label>
             <textarea 
               name="notes"
               id="notes"
               className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
               rows={3}
             ></textarea>
          </div>

        </div>
        <div className="flex items-center justify-end gap-x-6 border-t border-slate-900/10 px-4 py-4 sm:px-8 bg-slate-50 sm:rounded-b-xl">
          <Link href="/dashboard/reservations" className="text-sm font-semibold leading-6 text-slate-900 hover:text-slate-700 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Guardar Reserva
          </button>
        </div>
      </form>
    </div>
  )
}

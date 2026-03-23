import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Calendar, Clock, CalendarHeart, CheckCircle2, XCircle, PlayCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmada', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  pending:   { label: 'Pendiente',  className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  cancelled: { label: 'Cancelada',  className: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
  completed: { label: 'Completada', className: 'bg-slate-50 text-slate-600 ring-slate-500/10' },
  no_show:   { label: 'No acudió', className: 'bg-slate-50 text-slate-500 ring-slate-500/10' },
}

export default async function ReservationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      id, reservation_date, start_time, end_time, status, notes,
      customers(first_name, last_name),
      services(name),
      employees(name)
    `)
    .eq('business_id', profile?.business_id || '')
    .order('reservation_date', { ascending: true })
    .order('start_time', { ascending: true })

  async function updateReservationStatus(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const status = formData.get('status') as string
    
    const supabaseAction = await createClient()
    const { error } = await supabaseAction
      .from('reservations')
      .update({ status })
      .eq('id', id)

    if (!error) {
      revalidatePath('/dashboard/reservations')
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Reservas</h1>
          <p className="mt-2 text-sm text-slate-700">
            Gestiona todas las citas de tus clientes, asigna empleados y haz seguimiento del estado.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <Link
            href="/dashboard/reservations/new"
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nueva Reserva
          </Link>
        </div>
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <CalendarHeart className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Sin reservas aún</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Empieza creando la primera reserva para un cliente.
          </p>
          <Link
            href="/dashboard/reservations/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Crear primera reserva
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Cliente</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Servicio</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Empleado</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Fecha / Hora</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Estado</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-slate-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {reservations.map((r) => {
                const customer = r.customers as any
                const service = r.services as any
                const employee = r.employees as any
                const statusInfo = STATUS_LABELS[r.status] ?? { label: r.status, className: 'bg-slate-50 text-slate-600 ring-slate-500/10' }
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 truncate max-w-[200px]">
                      {customer ? `${customer.first_name} ${customer.last_name || ''}` : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{service?.name ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{employee?.name ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {r.reservation_date}
                        <Clock className="h-4 w-4 text-slate-400 ml-1" />
                        {r.start_time?.slice(0, 5)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        {r.status === 'pending' && (
                          <form action={updateReservationStatus}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value="confirmed" />
                            <button type="submit" className="text-emerald-600 hover:text-emerald-900 p-1 rounded-md hover:bg-emerald-50 transition-colors" title="Confirmar">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </form>
                        )}
                        {(r.status === 'pending' || r.status === 'confirmed') && (
                          <form action={updateReservationStatus}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value="completed" />
                            <button type="submit" className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors" title="Completar">
                              <PlayCircle className="w-5 h-5" />
                            </button>
                          </form>
                        )}
                        {r.status !== 'cancelled' && r.status !== 'completed' && (
                          <form action={updateReservationStatus}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value="cancelled" />
                            <button type="submit" className="text-rose-600 hover:text-rose-900 p-1 rounded-md hover:bg-rose-50 transition-colors" title="Cancelar">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

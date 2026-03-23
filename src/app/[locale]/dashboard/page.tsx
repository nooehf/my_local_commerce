import { createClient } from '@/utils/supabase/server'
import { Plus, CalendarHeart, Users, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const businessId = profile?.business_id || ''
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [
    { count: todayReservations },
    { count: tomorrowReservations },
    { count: totalCustomers },
    { data: lowStockItems },
    { data: upcomingReservations },
    { data: todayShifts },
  ] = await Promise.all([
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('reservation_date', today),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('reservation_date', tomorrow),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('inventory').select('id, current_stock, minimum_stock').eq('business_id', businessId),
    supabase.from('reservations').select('id, start_time, status, customers(first_name, last_name), services(name)').eq('business_id', businessId).eq('reservation_date', today).order('start_time').limit(5),
    supabase.from('staff_shifts').select('id, start_time, end_time, employees(id, profiles(name))').eq('business_id', businessId).eq('date', today),
  ])

  const lowStockCount = lowStockItems?.filter(i => i.current_stock <= i.minimum_stock).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Panel de Control</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/reservations/new" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Nueva Reserva
          </Link>
          <Link href="/dashboard/customers/new" className="inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Plus className="-ml-1 mr-2 h-4 w-4 text-slate-400" />
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
          <div className="p-5 flex items-center gap-4">
            <CalendarHeart className="h-8 w-8 text-indigo-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-500">Reservas hoy</p>
              <p className="text-2xl font-bold text-slate-900">{todayReservations ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
          <div className="p-5 flex items-center gap-4">
            <Clock className="h-8 w-8 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-500">Reservas mañana</p>
              <p className="text-2xl font-bold text-slate-900">{tomorrowReservations ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
          <div className="p-5 flex items-center gap-4">
            <Users className="h-8 w-8 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-500">Total clientes</p>
              <p className="text-2xl font-bold text-slate-900">{totalCustomers ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
          <div className="p-5 flex items-center gap-4">
            <AlertTriangle className={`h-8 w-8 shrink-0 ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-300'}`} />
            <div>
              <p className="text-sm font-medium text-slate-500">Stock bajo</p>
              <p className="text-2xl font-bold text-slate-900">{lowStockCount}</p>
            </div>
          </div>
          {lowStockCount > 0 && (
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
              <Link href="/dashboard/inventory" className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                Revisar inventario →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today reservations */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Reservas de hoy</h3>
            <Link href="/dashboard/reservations" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Ver todas →</Link>
          </div>
          <div className="px-6 py-5">
            {!upcomingReservations || upcomingReservations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No hay reservas para hoy.</p>
            ) : (
              <div className="space-y-3">
                {upcomingReservations.map((r) => {
                  const customer = r.customers as any
                  const service = r.services as any
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-4 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {customer ? `${customer.first_name} ${customer.last_name || ''}` : 'Sin cliente'}
                        </span>
                        <span className="text-xs text-slate-500 truncate">{service?.name ?? '—'}</span>
                      </div>
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20 shrink-0">
                        {r.start_time?.slice(0, 5)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Today shifts */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Empleados hoy</h3>
            <Link href="/dashboard/shifts" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Ver turnos →</Link>
          </div>
          <div className="px-6 py-5">
            {!todayShifts || todayShifts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No hay turnos programados para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayShifts.map((shift) => {
                  const employee = shift.employees as any
                  const name = employee?.profiles?.name ?? 'Sin nombre'
                  return (
                    <div key={shift.id} className="flex items-center justify-between gap-4 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0 uppercase">
                          {name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 truncate">{name}</span>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">
                        {shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

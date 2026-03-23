import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Mail, Phone, Users } from 'lucide-react'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, email, phone, total_visits, last_visit_date')
    .eq('business_id', profile?.business_id || '')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Clientes</h1>
          <p className="mt-2 text-sm text-slate-700">
            Gestiona la información de tus clientes y su historial de visitas.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <Link
            href="/dashboard/customers/new"
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {!customers || customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Sin clientes aún</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Registra a tus clientes para hacer seguimiento de su historial y fidelizarlos.
          </p>
          <Link
            href="/dashboard/customers/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Añadir primer cliente
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {customers.map((customer) => (
            <div key={customer.id} className="col-span-1 divide-y divide-slate-200 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="flex flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 shrink-0">
                    <span className="text-sm font-medium text-indigo-700 uppercase">
                      {customer.name?.charAt(0) || '?'}
                    </span>
                  </span>
                  <h3 className="text-sm font-medium text-slate-900">{customer.name}</h3>
                </div>
                <dl className="mt-4 flex flex-col gap-2">
                  {customer.email && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Mail className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Phone className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                  )}
                </dl>
                <div className="mt-6 flex gap-4 text-xs">
                  <div className="flex flex-col bg-slate-50 px-3 py-2 rounded-lg flex-1 border border-slate-100">
                    <span className="text-slate-500 font-medium">Visitas</span>
                    <span className="text-slate-900 font-bold text-sm">{customer.total_visits ?? 0}</span>
                  </div>
                  <div className="flex flex-col bg-slate-50 px-3 py-2 rounded-lg flex-1 border border-slate-100">
                    <span className="text-slate-500 font-medium">Última Visita</span>
                    <span className="text-slate-900 font-semibold text-sm">
                      {customer.last_visit_date ?? '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

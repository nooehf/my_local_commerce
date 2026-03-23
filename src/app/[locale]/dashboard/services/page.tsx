import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, currency, active')
    .eq('business_id', profile?.business_id || '')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Servicios</h1>
          <p className="mt-2 text-sm text-slate-700">
            Añade y gestiona los servicios que ofreces, sus precios y duración.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <Link
            href="/dashboard/services/new"
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo Servicio
          </Link>
        </div>
      </div>

      {!services || services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Sin servicios creados</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Define los servicios que ofreces a tus clientes, con su precio y duración.
          </p>
          <Link
            href="/dashboard/services/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Crear primer servicio
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Nombre</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Duración</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Precio</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                    {service.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {service.duration_minutes} min
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900 font-medium">
                    {service.currency === 'USD' ? '$' : '€'}{Number(service.price).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {service.active ? (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Activo</span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">Inactivo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

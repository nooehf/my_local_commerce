import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BusinessDataForm from '@/components/dashboard/BusinessDataForm'
import BusinessHoursForm from '@/components/dashboard/BusinessHoursForm'
import BusinessExceptionsManager from '@/components/dashboard/BusinessExceptionsManager'
import BusinessScheduleModal from '@/components/dashboard/BusinessScheduleModal'
import { CreditCard, Store, Clock, Calendar } from 'lucide-react'
import { getBusinessHoursAction, getBusinessExceptionsAction } from '@/lib/settings/actions'

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    const locale = (await params).locale
    return redirect(`/${locale}/dashboard`)
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, description, address, latitude, longitude, photo_url')
    .eq('id', profile?.business_id)
    .single()

  const { data: businessHours } = await getBusinessHoursAction()
  const { data: businessExceptions } = await getBusinessExceptionsAction()
  const locale = (await params).locale

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">Gestiona los detalles de tu negocio y preferencias.</p>
      </div>

      {/* Business Data */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-500" />
            Datos del Negocio
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">Esta información aparecerá en el mapa público de negocios.</p>
        </div>
        <div className="px-6 py-8">
          {business ? (
            <BusinessDataForm business={business} />
          ) : (
            <p className="text-sm text-slate-400">No se encontró el negocio asociado a tu cuenta.</p>
          )}
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Horario de Apertura
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">Configura los días y horas en los que tu negocio está abierto.</p>
          </div>
          <BusinessScheduleModal 
            standardHours={businessHours || []} 
            exceptions={businessExceptions || []} 
            locale={locale} 
          />
        </div>
        <div className="px-6 py-8">
          <BusinessHoursForm 
            initialHours={businessHours || []} 
            initialExceptions={businessExceptions || []}
            locale={locale} 
          />
        </div>
      </div>

      {/* Business Exceptions */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200">
        <div className="px-6 py-8">
          <BusinessExceptionsManager initialExceptions={businessExceptions || []} locale={locale} />
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            Suscripción y Pagos
          </h3>
        </div>
        <div className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-slate-900">Plan Actual: <span className="text-indigo-600">Pro</span></p>
            <p className="text-sm text-slate-500 mt-1">Tu próximo pago de $79.00 será el 21 de Abril de 2026.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
              Ver Facturas
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              Gestionar Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

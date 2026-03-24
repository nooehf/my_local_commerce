import { createClient } from '@/utils/supabase/server'
import dynamic from 'next/dynamic'
import { MapPin, Store } from 'lucide-react'

import MapWrapper from '@/components/MapWrapper'

export default async function MapPage() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, address, description, latitude, longitude, photo_url')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  const validBusinesses = (businesses || []).filter(
    b => b.latitude !== null && b.longitude !== null
  ) as {
    id: string
    name: string | null
    description: string | null
    address: string | null
    latitude: number
    longitude: number
    photo_url: string | null
  }[]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Negocios locales</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
          Descubre los negocios registrados en nuestra plataforma y encuéntralos en el mapa.
        </p>
      </div>

      {/* Map + sidebar */}
      <div className="flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            {validBusinesses.length} negocio{validBusinesses.length !== 1 ? 's' : ''} en el mapa
          </p>
          {validBusinesses.length === 0 ? (
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 text-center">
              <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aún no hay negocios con ubicación configurada.</p>
            </div>
          ) : (
            validBusinesses.map(b => (
              <div key={b.id} className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 flex items-center gap-3">
                {b.photo_url ? (
                  <img src={b.photo_url} alt={b.name || ''} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-indigo-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{b.name || 'Sin nombre'}</p>
                  {b.address && <p className="text-xs text-slate-400 truncate">{b.address}</p>}
                </div>
              </div>
            ))
          )}
        </aside>

        {/* Map */}
        <div className="w-full lg:flex-1 h-[500px] lg:h-auto min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-sm relative z-0">
          <MapWrapper businesses={validBusinesses} />
        </div>
      </div>
    </div>
  )
}

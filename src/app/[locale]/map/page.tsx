import { createAdminClient } from '@/utils/supabase/admin'
import { MapPin } from 'lucide-react'

import MapInteractive from '@/components/map/MapInteractive'

export default async function MapPage() {
  const supabase = createAdminClient()

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
      <div className="bg-white border-b border-slate-100 px-6 py-8 text-center pt-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Negocios locales</h1>
        <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto leading-relaxed">
          Descubre los negocios registrados en nuestra plataforma y encuéntralos en el mapa.
        </p>
      </div>

      {/* Interactive Interface */}
      <MapInteractive businesses={validBusinesses} />

    </div>
  )
}

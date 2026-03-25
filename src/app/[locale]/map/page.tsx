import { createClient } from '@/utils/supabase/server'
import { MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import MapInteractive from '@/components/map/MapInteractive'
import PublicNavbar from '@/components/PublicNavbar'

export default async function MapPage() {
  const supabase = await createClient()
  const t = await getTranslations('Map')

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, description, latitude, longitude, photo_url')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  console.log('--- MAP DEBUG ---')
  console.log('Businesses count:', businesses?.length || 0)
  if (error) console.error('Supabase error:', error)
  if (businesses) console.log('Sample business:', businesses[0])

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
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      <PublicNavbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-8 text-center pt-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('title')}</h1>
        <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* Interactive Interface */}
      <MapInteractive businesses={validBusinesses} />

    </div>
  )
}

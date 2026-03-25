'use client'

import { useState, useMemo } from 'react'
import { Store, Search, MapPin, List } from 'lucide-react'
import MapWrapper from '@/components/MapWrapper'

interface Business {
  id: string
  name: string | null
  description: string | null
  address: string | null
  latitude: number
  longitude: number
  photo_url: string | null
}

export default function MapInteractive({ businesses }: { businesses: Business[] }) {
  const [search, setSearch] = useState('')
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [isMobileListExpanded, setIsMobileListExpanded] = useState(false)

  const filteredBusinesses = useMemo(() => {
    if (!search.trim()) return businesses
    const query = search.toLowerCase()
    return businesses.filter(b => 
      b.name?.toLowerCase().includes(query) || 
      b.address?.toLowerCase().includes(query) ||
      b.description?.toLowerCase().includes(query)
    )
  }, [search, businesses])

  const showListOnMobile = isMobileListExpanded || search.trim() !== ''

  return (
    <div className="flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">

      {/* Sidebar */}
      <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative shadow-sm rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input 
            type="text"
            placeholder="Buscar por nombre, calle o servicio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white"
          />
        </div>

        {/* Mobile Expand Button (Only visible if not searching and list is collapsed) */}
        {!showListOnMobile && (
          <button 
            onClick={() => setIsMobileListExpanded(true)}
            className="lg:hidden w-full py-3 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold border border-indigo-100 flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <List className="w-4 h-4" />
            Ver listado de negocios
          </button>
        )}

        {/* List (Conditionally rendered on mobile, always visible on desktop) */}
        <div className={`flex flex-col gap-4 flex-1 ${showListOnMobile ? 'block' : 'hidden lg:flex'}`}>
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {filteredBusinesses.length} negocio{filteredBusinesses.length !== 1 ? 's' : ''} {search.trim() ? 'encontrados' : 'cerca'}
            </p>
            {isMobileListExpanded && !search.trim() && (
              <button 
                onClick={() => setIsMobileListExpanded(false)} 
                className="lg:hidden text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1"
              >
                Ocultar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[350px] lg:max-h-[600px]">
            {filteredBusinesses.length === 0 ? (
              <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">Sin resultados</p>
                <p className="text-xs text-slate-500">Prueba ajustando tu búsqueda.</p>
              </div>
            ) : (
              filteredBusinesses.map(b => (
                <div 
                  key={b.id} 
                  onClick={() => {
                    setSelectedBusinessId(b.id)
                    // Auto-scroll to map on mobile
                    if (window.innerWidth < 1024) {
                      const mapEl = document.getElementById('business-map-container')
                      if (mapEl) {
                        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }
                  }}
                  className={`group bg-white rounded-2xl ring-1 transition-all p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
                    selectedBusinessId === b.id 
                      ? 'ring-indigo-500 shadow-md bg-indigo-50/20' 
                      : 'ring-slate-200/80 shadow-sm hover:ring-indigo-300'
                  }`}
                >
                  {b.photo_url ? (
                    <img src={b.photo_url} alt={b.name || ''} className={`w-14 h-14 rounded-xl object-cover shrink-0 transition-all ${selectedBusinessId === b.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`} />
                  ) : (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all ${selectedBusinessId === b.id ? 'bg-indigo-600 ring-2 ring-indigo-600 ring-offset-2' : 'bg-indigo-50'}`}>
                      <Store className={`w-6 h-6 ${selectedBusinessId === b.id ? 'text-white' : 'text-indigo-400'}`} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold truncate ${selectedBusinessId === b.id ? 'text-indigo-700' : 'text-slate-900 group-hover:text-indigo-600 transition-colors'}`}>
                      {b.name || 'Sin nombre'}
                    </p>
                    {b.address && (
                      <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{b.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Map */}
      <div id="business-map-container" className="w-full lg:flex-1 h-[450px] lg:h-auto min-h-[450px] lg:min-h-[700px] rounded-3xl overflow-hidden ring-1 ring-slate-200/80 shadow-lg relative z-0">
        <MapWrapper businesses={businesses} selectedBusinessId={selectedBusinessId} />
      </div>
    </div>
  )
}

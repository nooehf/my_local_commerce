'use client'

import dynamic from 'next/dynamic'

export const DraggableMapWrapper = dynamic(
  () => import('./DraggableMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-56 rounded-2xl bg-slate-50 flex flex-col items-center justify-center mt-4 ring-1 ring-slate-200 shadow-sm text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium">Cargando mapa interactivo...</span>
      </div>
    )
  }
)

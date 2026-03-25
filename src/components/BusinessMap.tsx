'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Business {
  id: string
  name: string | null
  description: string | null
  address: string | null
  latitude: number
  longitude: number
  photo_url: string | null
}

interface Props {
  businesses: Business[]
}

export default function BusinessMap({ businesses }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically import Leaflet (client-only)
    import('leaflet').then(L => {
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Calculate initial center
      const center: [number, number] =
        businesses.length > 0
          ? [businesses[0].latitude, businesses[0].longitude]
          : [40.416775, -3.70379] // Madrid default

      const map = L.map(mapRef.current!).setView(center, businesses.length > 1 ? 6 : 13)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      businesses.forEach(b => {
        // Card-style HTML with image seamlessly filling the top
        const photoHtml = b.photo_url 
          ? `<img src="${b.photo_url}" class="w-full h-[72px] object-cover border-b border-slate-100" />`
          : `<div class="w-full h-[72px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-b border-slate-100/50">
               <span class="text-white font-bold text-2xl drop-shadow-sm">${(b.name || 'N').charAt(0).toUpperCase()}</span>
             </div>`;

        const iconHtml = `
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group w-max">
            <!-- Vertical Card Box (overflow-hidden to crop image to borders) -->
            <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] ring-1 ring-slate-900/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-[0_12px_24px_rgba(79,70,229,0.25)] group-hover:ring-indigo-500/50 w-[72px] overflow-hidden flex flex-col">
              ${photoHtml}
              <div class="px-1.5 py-1.5 flex items-center justify-center min-h-[30px] bg-white">
                <span class="font-bold text-[10px] text-slate-800 tracking-tight text-center leading-[1.15] line-clamp-2">${b.name || 'Negocio'}</span>
              </div>
            </div>
            <!-- Pointer Arrow -->
            <div class="w-4 h-4 bg-white ring-1 ring-slate-900/5 rotate-45 -mt-[9px] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-indigo-500/50" style="clip-path: polygon(100% 0, 100% 100%, 0 100%);"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'bg-transparent border-none',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
          popupAnchor: [0, -96] // Adjusted further up to match the taller card
        });

        const popup = `
          <div style="min-width:180px;font-family:sans-serif">
            ${b.photo_url ? `<img src="${b.photo_url}" style="width:100%;height:120px;object-fit:cover;border-radius:12px;margin-bottom:12px" />` : ''}
            <strong style="font-size:16px;color:#0f172a;display:block;margin-bottom:4px">${b.name || 'Negocio'}</strong>
            <span style="font-size:13px;color:#64748b;display:block;margin-bottom:8px">${b.address || ''}</span>
            ${b.description ? `<p style="font-size:14px;color:#475569;margin:0;line-height:1.5">${b.description}</p>` : ''}
          </div>
        `

        L.marker([b.latitude, b.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popup)
      })

      // Fit map to all markers
      if (businesses.length > 1) {
        const bounds = L.latLngBounds(businesses.map(b => [b.latitude, b.longitude]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      // Fix race condition with CSS loading and containers
      setTimeout(() => {
        map.invalidateSize()
      }, 200)
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [businesses])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[500px] rounded-2xl z-0" 
      style={{ position: 'relative' }}
    />
  )
}

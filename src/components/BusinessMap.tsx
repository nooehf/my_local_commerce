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
        const popup = `
          <div style="min-width:180px;font-family:sans-serif">
            ${b.photo_url ? `<img src="${b.photo_url}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ''}
            <strong style="font-size:15px;color:#0f172a;display:block;margin-bottom:4px">${b.name || 'Negocio'}</strong>
            ${b.description ? `<p style="font-size:13px;color:#475569;margin:0;line-height:1.4">${b.description}</p>` : ''}
          </div>
        `
        L.marker([b.latitude, b.longitude])
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

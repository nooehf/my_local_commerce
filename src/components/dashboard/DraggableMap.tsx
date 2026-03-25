'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Props {
  latitude: number
  longitude: number
  onChange: (lat: number, lng: number) => void
}

export default function DraggableMap({ latitude, longitude, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      // Fix default icons lacking in webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if ((mapRef.current as any)._leaflet_id) {
        return;
      }

      const map = L.map(mapRef.current!).setView([latitude, longitude], 17)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([latitude, longitude], {
        draggable: true,
      }).addTo(map)

      markerRef.current = marker

      // Listen for the drop event
      marker.on('dragend', () => {
        const newPos = marker.getLatLng()
        onChange(newPos.lat, newPos.lng)
      })

      setTimeout(() => {
        map.invalidateSize()
      }, 100)
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, []) // Empty deps = run once

  // Reactive updates on external prop change (e.g. typing a new city in the search bar)
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return
    const currentMap = mapInstanceRef.current
    const currentMarker = markerRef.current
    
    // Only move if external value diverges from current pin state 
    // (this avoids cyclic shaking when the user drags the pin)
    const currentPos = currentMarker.getLatLng()
    if (Math.abs(currentPos.lat - latitude) > 0.00001 || Math.abs(currentPos.lng - longitude) > 0.00001) {
      currentMap.panTo([latitude, longitude], { animate: true })
      currentMarker.setLatLng([latitude, longitude])
    }
  }, [latitude, longitude])

  return (
    <div className="w-full h-56 rounded-2xl overflow-hidden ring-1 ring-slate-200 mt-4 relative z-0 shadow-sm">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}

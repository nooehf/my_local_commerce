'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Store, MapPin, FileText, Image as ImageIcon, CheckCircle2, X, Search } from 'lucide-react'

interface BusinessData {
  id: string
  name: string | null
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  photo_url: string | null
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface Props {
  business: BusinessData
}

const inputClass = 'block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-slate-50/50'

export default function BusinessDataForm({ business }: Props) {
  const supabase = createClient()
  const [name, setName] = useState(business.name || '')
  const [description, setDescription] = useState(business.description || '')
  const [address, setAddress] = useState(business.address || '')
  const [latitude, setLatitude] = useState(business.latitude)
  const [longitude, setLongitude] = useState(business.longitude)
  const [photoUrl, setPhotoUrl] = useState(business.photo_url || '')
  const [photoPreview, setPhotoPreview] = useState(business.photo_url || '')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 200 * 1024) {
      setPhotoError('La foto no puede superar los 200 KB.')
      return
    }
    setPhotoError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const searchLocation = useCallback((query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (query.length < 3) { setSuggestions([]); return }
    setSearchLoading(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } }
        )
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
      } catch {
        setSuggestions([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)
  }, [])

  const selectSuggestion = (item: NominatimResult) => {
    setAddress(item.display_name)
    setLatitude(parseFloat(item.lat))
    setLongitude(parseFloat(item.lon))
    setSuggestions([])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre del negocio es obligatorio.'); return }
    if (!address.trim() || latitude === null || longitude === null) {
      setError('La ubicación es obligatoria. Selecciona una opción del desplegable.')
      return
    }
    setSaving(true)
    setError(null)

    let finalPhotoUrl = photoUrl

    // Upload photo if changed
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${business.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('business-photos')
        .upload(path, photoFile, { upsert: true })
      if (uploadError) {
        setError('Error al subir la foto: ' + uploadError.message)
        setSaving(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('business-photos').getPublicUrl(path)
      finalPhotoUrl = publicUrl
      setPhotoUrl(publicUrl)
    }

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        address: address.trim(),
        latitude,
        longitude,
        photo_url: finalPhotoUrl || null,
      })
      .eq('id', business.id)

    setSaving(false)
    if (updateError) {
      setError('Error al guardar: ' + updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">

      {/* Photo */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">
          <ImageIcon className="inline w-4 h-4 mr-1.5 -mt-0.5 text-slate-400" />
          Foto del Negocio
        </label>
        <div className="flex items-center gap-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
          >
            {photoPreview
              ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              : <Store className="w-8 h-8 text-slate-300" />
            }
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {photoPreview ? 'Cambiar foto' : 'Subir foto'}
            </button>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG o WebP · Máx 200 KB</p>
            {photoError && (
              <div className="mt-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2 py-1.5 inline-block">
                {photoError}
              </div>
            )}
            {photoFile && (
              <button
                type="button"
                onClick={() => { setPhotoFile(null); setPhotoPreview(photoUrl); setPhotoError(null); }}
                className="mt-2 text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium bg-rose-50/50 px-2 py-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" /> Quitar foto
              </button>
            )}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          <Store className="inline w-4 h-4 mr-1.5 -mt-0.5 text-slate-400" />
          Nombre del Negocio <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej. Peluquería Estilo"
          className={inputClass}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          <FileText className="inline w-4 h-4 mr-1.5 -mt-0.5 text-slate-400" />
          Descripción
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Breve descripción de tu negocio..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Location autocomplete */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          <MapPin className="inline w-4 h-4 mr-1.5 -mt-0.5 text-slate-400" />
          Ubicación <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {searchLoading
              ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              : <Search className="w-4 h-4 text-slate-400" />
            }
          </div>
          <input
            type="text"
            value={address}
            onChange={e => { setAddress(e.target.value); setLatitude(null); setLongitude(null); searchLocation(e.target.value) }}
            placeholder="Busca una dirección o ciudad..."
            className={`${inputClass} pl-11`}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-xl ring-1 ring-slate-200 overflow-hidden text-sm">
              {suggestions.map(s => (
                <li
                  key={s.place_id}
                  onClick={() => selectSuggestion(s)}
                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0 text-slate-700"
                >
                  <MapPin className="inline w-3.5 h-3.5 mr-2 text-indigo-400 -mt-0.5" />
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {latitude && longitude && (
          <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ubicación confirmada: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        )}
      </div>

      {/* Error/success */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Cambios guardados correctamente.
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60"
        >
          <CheckCircle2 className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

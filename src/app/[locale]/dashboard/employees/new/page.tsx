'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Camera } from 'lucide-react'
import { inviteWorkerAction } from '../actions'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function NewEmployeePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const locale = useLocale()
  const router = useRouter()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 200 * 1024) {
        alert('La foto debe ser menor a 200KB')
        e.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      await inviteWorkerAction(formData, locale)
      router.push(`/${locale}/dashboard/employees`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/employees" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invitar Trabajador</h1>
          <p className="text-sm text-slate-500 mt-0.5">Se enviará una invitación por email</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <input 
                type="file" 
                name="photo" 
                accept="image/*" 
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border border-slate-200 text-slate-600 group-hover:text-indigo-600 transition-colors">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500">Foto de perfil (máx. 200KB)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                name="first_name"
                type="text"
                required
                placeholder="Ej. Juan"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Apellidos
              </label>
              <input
                name="last_name"
                type="text"
                placeholder="Ej. García"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email / Invitación <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="juan@empresa.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="+34 612 345 678"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cargo / Puesto
              </label>
              <input
                name="position"
                type="text"
                placeholder="Ej. Estilista, Recepcionista..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/dashboard/employees"
              className="flex-1 text-center px-6 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Invitando...
                </>
              ) : (
                'Enviar Invitación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

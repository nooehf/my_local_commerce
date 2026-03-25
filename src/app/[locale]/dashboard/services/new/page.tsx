import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const createService = async (formData: FormData) => {
    'use server'
    const headersList = await headers()
    const currentLocale = headersList.get('x-next-intl-locale') ?? 'es'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect(`/${currentLocale}/login`)

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .eq('id', user.id)
      .single()

    if (!profile?.business_id) return redirect(`/${currentLocale}/dashboard/services`)

    const { error } = await supabase.from('services').insert({
      business_id: profile.business_id,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      price: parseFloat(formData.get('price') as string),
      currency: formData.get('currency') as string,
      duration_minutes: parseInt(formData.get('duration') as string),
      active: formData.get('active') === 'on',
    })

    if (error) return redirect(`/${currentLocale}/dashboard/services/new?error=${encodeURIComponent(error.message)}`)
    redirect(`/${currentLocale}/dashboard/services`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/services" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Servicio</h1>
          <p className="text-sm text-slate-500 mt-0.5">Define un servicio que ofreces a tus clientes</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Error: {decodeURIComponent(error)}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <form action={createService} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre del Servicio <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Corte de pelo, Manicura..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Descripción breve del servicio..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Divisa
              </label>
              <select
                name="currency"
                defaultValue="EUR"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="EUR">€ Euro (EUR)</option>
                <option value="USD">$ Dólar (USD)</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Precio <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                required
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duración (min) <span className="text-red-500">*</span>
              </label>
              <input
                name="duration"
                type="number"
                required
                min="5"
                step="5"
                placeholder="30"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <input
              id="active"
              name="active"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-slate-700">
              Servicio activo (visible para reservas)
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            <Link
              href="/dashboard/services"
              className="flex-1 text-center px-6 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              Guardar Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

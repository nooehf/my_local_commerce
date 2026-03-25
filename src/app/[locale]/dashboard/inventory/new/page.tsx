import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewInventoryPage() {
  const createProduct = async (formData: FormData) => {
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

    if (!profile?.business_id) return redirect(`/${currentLocale}/dashboard/inventory`)

    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const sku = formData.get('sku') as string
    const category = formData.get('category') as string
    const current_stock = parseInt(formData.get('current_stock') as string)
    const minimum_stock = parseInt(formData.get('minimum_stock') as string)

    // Create the product first
    const { data: product, error: productError } = await supabase.from('products').insert({
      business_id: profile.business_id,
      name,
      price,
      sku,
      category,
      active: true,
    }).select().single()

    if (productError) return redirect(`/${currentLocale}/dashboard/inventory/new?error=${productError.message}`)

    // Then create the inventory record
    await supabase.from('inventory').insert({
      business_id: profile.business_id,
      product_id: product.id,
      current_stock,
      minimum_stock,
    })

    redirect(`/${currentLocale}/dashboard/inventory`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/inventory" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Producto</h1>
          <p className="text-sm text-slate-500 mt-0.5">Añade un producto al inventario</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <form action={createProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Champú Argan"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Precio (€) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                required
                step="0.01"
                min="0"
                placeholder="9.99"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                SKU / Referencia
              </label>
              <input
                name="sku"
                type="text"
                placeholder="CHAMP-001"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoría
              </label>
              <input
                name="category"
                type="text"
                placeholder="Cuidado del cabello"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock Actual <span className="text-red-500">*</span>
              </label>
              <input
                name="current_stock"
                type="number"
                required
                min="0"
                defaultValue="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock Mínimo (alerta)
              </label>
              <input
                name="minimum_stock"
                type="number"
                min="0"
                defaultValue="5"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/dashboard/inventory"
              className="flex-1 text-center px-6 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              Añadir al Inventario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

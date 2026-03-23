import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Package, AlertTriangle, ArrowRightLeft } from 'lucide-react'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user!.id)
    .single()

  const { data: inventoryItems } = await supabase
    .from('inventory')
    .select('id, current_stock, minimum_stock, products(id, name, sku, price, category)')
    .eq('business_id', profile?.business_id || '')

  const lowStockCount = inventoryItems?.filter(
    (item) => item.current_stock <= item.minimum_stock
  ).length ?? 0

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Inventario</h1>
          <p className="mt-2 text-sm text-slate-700">
            Controla el stock de tus productos y recibe alertas de reposición.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-3">
          <Link
            href="/dashboard/inventory/movements"
            className="flex items-center justify-center rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowRightLeft className="-ml-0.5 mr-1.5 h-4 w-4 text-slate-500" />
            Movimientos
          </Link>
          <Link
            href="/dashboard/inventory/new"
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo Producto
          </Link>
        </div>
      </div>

      {!inventoryItems || inventoryItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <Package className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Sin productos en el inventario</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Añade tus productos para controlar el stock y recibir alertas automáticas de reposición.
          </p>
          <Link
            href="/dashboard/inventory/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Añadir primer producto
          </Link>
        </div>
      ) : (
        <>
          {lowStockCount > 0 && (
            <div className="rounded-xl bg-orange-50 p-4 border border-orange-200 mt-6">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">Atención requerida</h3>
                  <p className="mt-1 text-sm text-orange-700">
                    Hay {lowStockCount} producto{lowStockCount > 1 ? 's' : ''} con stock bajo o agotado.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-slate-300">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Producto</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">SKU</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Stock Actual</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Stock Mínimo</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {inventoryItems.map((item) => {
                  const product = item.products as any
                  const isLow = item.current_stock <= item.minimum_stock
                  const isOut = item.current_stock === 0
                  return (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 flex items-center gap-3">
                        <Package className="w-5 h-5 text-slate-400" />
                        {product?.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{product?.sku || '—'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-900">{item.current_stock}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.minimum_stock}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {isOut ? (
                          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">Agotado</span>
                        ) : isLow ? (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Stock Bajo</span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Normal</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

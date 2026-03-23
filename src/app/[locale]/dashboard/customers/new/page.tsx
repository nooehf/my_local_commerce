import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const createCustomer = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .eq('id', user.id)
      .single()

    if (!profile?.business_id) return redirect('/dashboard/customers')

    const { error } = await supabase.from('customers').insert({
      business_id: profile.business_id,
      name: formData.get('name') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      notes: formData.get('notes') as string || null,
    })

    if (error) {
      return redirect(`/dashboard/customers/new?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/dashboard/customers')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 lg:mt-8">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/dashboard/customers" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Añadir Nuevo Cliente</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Error: {decodeURIComponent(error)}
        </div>
      )}

      <form action={createCustomer} className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8 space-y-6">
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
              Nombre Completo *
            </label>
            <input 
              name="name"
              type="text" 
              id="name" 
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                Email
              </label>
              <input 
                name="email"
                type="email" 
                id="email" 
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-900">
                Teléfono
              </label>
              <input 
                name="phone"
                type="tel" 
                id="phone" 
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
              />
            </div>
          </div>

          <div>
             <label htmlFor="notes" className="block text-sm font-medium leading-6 text-slate-900">
                Notas (Alergias, preferencias, etc.)
             </label>
             <textarea 
               name="notes"
               id="notes" 
               className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
               rows={3}
             ></textarea>
          </div>

        </div>
        <div className="flex items-center justify-end gap-x-6 border-t border-slate-900/10 px-4 py-4 sm:px-8 bg-slate-50 sm:rounded-b-xl">
          <Link href="/dashboard/customers" className="text-sm font-semibold leading-6 text-slate-900">
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Guardar Cliente
          </button>
        </div>
      </form>
    </div>
  )
}

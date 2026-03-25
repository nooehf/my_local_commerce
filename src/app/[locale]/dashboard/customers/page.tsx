import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, Mail, Phone, Users } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import DeleteCustomerButton from '@/components/dashboard/DeleteCustomerButton'

async function deleteCustomerAction(formData: FormData) {
  'use server'
  const customerId = formData.get('id') as string
  const customerUserId = formData.get('user_id') as string
  
  console.log('--- DELETE CUSTOMER START ---')
  console.log('ID:', customerId, 'UserID:', customerUserId)

  try {
    const adminClient = createAdminClient()
    console.log('Admin client initialized')

    // 1. Delete CRM record
    console.log('Attempting DB delete...')
    const { error: customerError } = await adminClient
      .from('customers')
      .delete()
      .eq('id', customerId)

    if (customerError) {
      console.error('DB Delete Error:', customerError)
      return
    }
    console.log('DB Delete Success')

    // 2. Delete Auth account
    const { data: customerData } = await adminClient
      .from('customers')
      .select('email, user_id')
      .eq('id', customerId)
      .single()

    let targetUserId = customerUserId || customerData?.user_id

    if (!targetUserId && customerData?.email) {
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
      if (!listError) {
        const existingUser = users.find((u: any) => u.email?.toLowerCase() === customerData.email.toLowerCase())
        if (existingUser) targetUserId = existingUser.id
      }
    }

    if (targetUserId) {
      console.log('Attempting Auth delete for:', targetUserId)
      const { error: authError } = await adminClient.auth.admin.deleteUser(targetUserId)
      if (authError) {
        console.error('Auth Delete Error (continuing):', authError)
      } else {
        console.log('Auth Delete Success')
      }
    }

    console.log('Revalidating paths...')
    revalidatePath('/[locale]/dashboard/customers', 'page')
    console.log('--- DELETE CUSTOMER END ---')
  } catch (err) {
    console.error('CRITICAL ACTION ERROR:', err)
  }
}

export default async function CustomersPage() {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const t = await getTranslations('Customers')

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', authUser!.id)
    .single()

  const { data: customers } = await supabase
    .from('customers')
    .select('id, first_name, last_name, email, phone, total_visits, last_visit_date, user_id')
    .eq('business_id', profile?.business_id || '')
    .order('first_name')

  // Fetch all auth users to determine status
  const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers()
  
  // Create a map of user_id to last_sign_in_at
  const authStatusMap = new Map(
    authUsers.map((u: any) => [u.id, u.last_sign_in_at || null])
  )

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Clientes</h1>
          <p className="mt-2 text-sm text-slate-700">
            Gestiona la información de tus clientes y su historial de visitas.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <Link
            href="/dashboard/customers/new"
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {!customers || customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Sin clientes aún</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Registra a tus clientes para hacer seguimiento de su historial y fidelizarlos.
          </p>
          <Link
            href="/dashboard/customers/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Añadir primer cliente
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {customers.map((customer: any) => {
            const lastSignIn = customer.user_id ? authStatusMap.get(customer.user_id) : null
            const isActive = !!lastSignIn
            const isInvited = !!customer.user_id && !isActive

            return (
              <div key={customer.id} className="relative group col-span-1 divide-y divide-slate-200 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all">
                
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteCustomerButton 
                    customerId={customer.id} 
                    userId={customer.user_id} 
                    deleteAction={deleteCustomerAction} 
                  />
                </div>

                <div className="flex flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 shrink-0">
                        <span className="text-sm font-medium text-indigo-700 uppercase">
                          {customer.first_name?.charAt(0) || '?'}
                        </span>
                      </span>
                      <h3 className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                        {customer.first_name} {customer.last_name}
                      </h3>
                    </div>
                    {customer.user_id && (
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                          : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                      }`}>
                        {isActive ? t('status_active') : t('status_invited')}
                      </span>
                    )}
                  </div>
                  <dl className="mt-4 flex flex-col gap-2">
                    {customer.email && (
                      <div className="flex items-center text-sm text-slate-500">
                        <Mail className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center text-sm text-slate-500">
                        <Phone className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                    )}
                  </dl>
                  <div className="mt-6 flex gap-4 text-xs">
                    <div className="flex flex-col bg-slate-50 px-3 py-2 rounded-lg flex-1 border border-slate-100">
                      <span className="text-slate-500 font-medium">Visitas</span>
                      <span className="text-slate-900 font-bold text-sm">{customer.total_visits ?? 0}</span>
                    </div>
                    <div className="flex flex-col bg-slate-50 px-3 py-2 rounded-lg flex-1 border border-slate-100">
                      <span className="text-slate-500 font-medium">Última Visita</span>
                      <span className="text-slate-900 font-semibold text-sm truncate">
                        {customer.last_visit_date ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

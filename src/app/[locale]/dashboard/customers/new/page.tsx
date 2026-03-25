import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, Info, StickyNote, CheckCircle2 } from 'lucide-react'

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const createCustomerAction = async (formData: FormData) => {
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

    if (!profile?.business_id) return redirect(`/${currentLocale}/dashboard/customers`)

    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string || null
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string || null
    const notes = formData.get('notes') as string || null

    if (!firstName || !email) {
      return redirect(`/${currentLocale}/dashboard/customers/new?error=${encodeURIComponent('Nombre y Email son obligatorios.')}`)
    }

    const adminClient = createAdminClient()

    // 1. Send Invitation via Supabase Auth
    let authUserId: string | undefined

    const host = headersList.get('host')
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    const origin = `${protocol}://${host}`
    const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1')
    const siteUrl = isLocal ? origin : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mylocalcommerce.com')

    const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: lastName ? `${firstName} ${lastName}` : firstName,
        role: 'customer',
        business_id: profile.business_id,
        first_name: firstName,
        last_name: lastName,
        locale: currentLocale
      },
      redirectTo: `${siteUrl}/${currentLocale}/auth/confirm?type=invite&next=/${currentLocale}/set-password`
    })

    if (authError) {
      // If user already exists, try to find them and link them
      if (authError.message.includes('already been registered') || authError.status === 422) {
        // We list users to find the one with this email
        // Note: For large user bases, this might need pagination, but for now it works
        const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
        
        if (listError) {
          return redirect(`/${currentLocale}/dashboard/customers/new?error=${encodeURIComponent('Error al buscar usuario existente: ' + listError.message)}`)
        }

        const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
        
        if (existingUser) {
          authUserId = existingUser.id
          // Update their metadata to ensure they are linked to this business and have the right role
          await adminClient.auth.admin.updateUserById(authUserId, {
            user_metadata: {
              full_name: lastName ? `${firstName} ${lastName}` : firstName,
              role: 'customer',
              business_id: profile.business_id,
              first_name: firstName,
              last_name: lastName,
              locale: currentLocale
            }
          })
        } else {
          return redirect(`/${currentLocale}/dashboard/customers/new?error=${encodeURIComponent(authError.message)}`)
        }
      } else {
        return redirect(`/${currentLocale}/dashboard/customers/new?error=${encodeURIComponent(authError.message)}`)
      }
    } else {
      authUserId = authData.user.id
    }

    // 2. Create the customer record in the CRM table
    const { error: customerError } = await adminClient.from('customers').insert({
      business_id: profile.business_id,
      user_id: authUserId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      notes: notes,
    })

    if (customerError) {
      // If the error is 'duplicate key' on email in public.customers, it means 
      // there's already a CRM record for this email in this business (or another).
      return redirect(`/${currentLocale}/dashboard/customers/new?error=${encodeURIComponent('Este cliente ya está registrado en tu base de datos.')}`)
    }

    redirect(`/${currentLocale}/dashboard/customers`)
  }

  const inputClasses = "block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-slate-50/50"
  const labelClasses = "block text-sm font-semibold leading-6 text-slate-900 mb-2"

  return (
    <div className="max-w-2xl mx-auto space-y-8 lg:mt-8 pb-12">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <Link href="/dashboard/customers" className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Cliente</h1>
          <p className="text-sm text-slate-500 mt-1">Registra a un nuevo cliente y envíale una invitación.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 flex items-center gap-3">
          <Info className="w-5 h-5 text-rose-500 shrink-0" />
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createCustomerAction} className="bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10 space-y-10">
          
          {/* Info Banner */}
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-900">Invitación por correo</h3>
              <p className="text-sm text-indigo-700/80 mt-1 leading-relaxed">
                Al crear el cliente, recibirá automáticamente un email con un enlace para configurar su acceso y contraseña.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <label htmlFor="first_name" className={labelClasses}>
                Nombre <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  name="first_name"
                  type="text" 
                  id="first_name" 
                  placeholder="Ej. Juan"
                  className={`${inputClasses} pl-11`}
                  required 
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label htmlFor="last_name" className={labelClasses}>
                Apellidos
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  name="last_name"
                  type="text" 
                  id="last_name" 
                  placeholder="Ej. Pérez García"
                  className={`${inputClasses} pl-11`}
                />
              </div>
              <p className="text-[11px] text-slate-400 pl-1">Opcional</p>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className={labelClasses}>
              Email de Invitación <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input 
                name="email"
                type="email" 
                id="email" 
                placeholder="cliente@ejemplo.com"
                className={`${inputClasses} pl-11`}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="phone" className={labelClasses}>
              Teléfono de contacto
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input 
                name="phone"
                type="tel" 
                id="phone" 
                placeholder="+34 600 000 000"
                className={`${inputClasses} pl-11`}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className={labelClasses}>
              Notas y Preferencias
            </label>
            <div className="relative group">
               <div className="absolute top-3.5 left-3.5 pointer-events-none">
                 <StickyNote className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               </div>
               <textarea 
                 name="notes"
                 id="notes" 
                 className={`${inputClasses} pl-11 min-h-[120px] resize-none`}
                 placeholder="Indica alergias, preferencias de horario, historial relevante..."
               ></textarea>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-between gap-x-6 border-t border-slate-100 px-6 py-6 sm:px-10 bg-slate-50/50">
          <Link href="/dashboard/customers" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            Cancelar y volver
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Crear y Enviar Invitación
          </button>
        </div>
      </form>
    </div>
  )
}

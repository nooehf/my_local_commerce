'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { routing } from '@/i18n/routing'

/**
 * Global result type for Server Actions
 */
export type ActionResult<T> = {
  data: T;
  error: string | null;
}

/**
 * Helper to resolve the correct locale for navigation/revalidation.
 * Validates against routing.locales and fallbacks to routing.defaultLocale.
 */
async function resolveLocale(passedLocale?: string | null): Promise<string> {
  const { locales, defaultLocale } = routing
  const headersList = await headers()
  const headerLocale = headersList.get('x-next-intl-locale')
  
  if (passedLocale && (locales as unknown as string[]).includes(passedLocale)) {
    return passedLocale
  }
  
  if (headerLocale && (locales as unknown as string[]).includes(headerLocale)) {
    return headerLocale
  }
  
  return defaultLocale
}

/**
 * Helper to get admin profile and ensure authorization.
 * ALLOWS: 'admin' and 'super_admin' roles.
 */
async function getAdminProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('business_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) throw new Error('Perfil no encontrado')
  
  // Guard admin (admin o super_admin)
  if (profile.role !== 'admin' && profile.role !== 'super_admin') {
    throw new Error('Solo los administradores pueden realizar esta acción')
  }

  return { profile, user, supabase }
}

/**
 * GETTERS
 */

export async function getTeamMembers(): Promise<ActionResult<any[]>> {
  try {
    const { profile, supabase } = await getAdminProfile()

    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('name')

    if (error) throw error
    return { data: employees || [], error: null }
  } catch (err: any) {
    console.error('Error fetching team members:', err)
    return { data: [], error: err.message || 'Error al obtener equipo' }
  }
}

export async function getEmployeeDetail(employeeId: string): Promise<ActionResult<any | null>> {
  try {
    const { profile, supabase } = await getAdminProfile()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .eq('business_id', profile.business_id)
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (err: any) {
    console.error('Error fetching employee detail:', err)
    return { data: null, error: err.message || 'Error al obtener detalle del empleado' }
  }
}

export async function getServicesAction(): Promise<ActionResult<any[]>> {
  try {
    const { profile, supabase } = await getAdminProfile()
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', profile.business_id)
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (err: any) {
    console.error('Error fetching services:', err)
    return { data: [], error: err.message || 'Error al obtener servicios' }
  }
}

export async function getEmployeeSkillsAction(employeeId: string): Promise<ActionResult<any[]>> {
  try {
    const { profile, supabase } = await getAdminProfile()
    const { data, error } = await supabase
      .from('employee_services')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('business_id', profile.business_id)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (err: any) {
    console.error('Error fetching employee skills:', err)
    return { data: [], error: err.message || 'Error al obtener habilidades' }
  }
}

export async function getEmployeeShiftsAction(employeeId: string): Promise<ActionResult<any[]>> {
  try {
    const { profile, supabase } = await getAdminProfile()
    const { data, error } = await supabase
      .from('staff_shifts')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('business_id', profile.business_id)
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (err: any) {
    console.error('Error fetching employee shifts:', err)
    return { data: [], error: err.message || 'Error al obtener turnos' }
  }
}

/**
 * MUTATIONS
 */

export async function assignServiceAction(employeeId: string, serviceId: string, locale?: string) {
  const { profile, supabase } = await getAdminProfile()
  const finalLocale = await resolveLocale(locale)
  
  const { error } = await supabase
    .from('employee_services')
    .insert({
      business_id: profile.business_id,
      employee_id: employeeId,
      service_id: serviceId,
      is_active: true
    })
  
  if (error) throw new Error(`Error al asignar servicio: ${error.message}`)
  revalidatePath(`/${finalLocale}/dashboard/team/${employeeId}`)
}

export async function unassignServiceAction(employeeId: string, serviceId: string, locale?: string) {
  const { profile, supabase } = await getAdminProfile()
  const finalLocale = await resolveLocale(locale)
  
  const { error } = await supabase
    .from('employee_services')
    .delete()
    .eq('employee_id', employeeId)
    .eq('service_id', serviceId)
    .eq('business_id', profile.business_id)
  
  if (error) throw new Error(`Error al desasignar servicio: ${error.message}`)
  revalidatePath(`/${finalLocale}/dashboard/team/${employeeId}`)
}

export async function updateServiceOverrideAction(
  employeeId: string, 
  serviceId: string, 
  overrides: { duration_minutes_override?: number | null, price_override?: number | null },
  locale?: string
) {
  const { profile, supabase } = await getAdminProfile()
  const finalLocale = await resolveLocale(locale)
  
  const { error } = await supabase
    .from('employee_services')
    .update(overrides)
    .eq('employee_id', employeeId)
    .eq('service_id', serviceId)
    .eq('business_id', profile.business_id)
  
  if (error) throw new Error(`Error al actualizar overrides: ${error.message}`)
  revalidatePath(`/${finalLocale}/dashboard/team/${employeeId}`)
}

export async function createShiftAction(data: {
  employee_id: string,
  start_at: string,
  end_at: string,
  type: 'work' | 'break' | 'time_off',
  notes?: string
}, locale?: string) {
  const { profile, supabase } = await getAdminProfile()
  const finalLocale = await resolveLocale(locale)

  // 1. Validate dates
  const start = new Date(data.start_at)
  const end = new Date(data.end_at)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Las fechas proporcionadas no tienen un formato válido')
  }

  // 2. Chronological check
  if (end <= start) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
  }
  
  const { error } = await supabase
    .from('staff_shifts')
    .insert({
      ...data,
      business_id: profile.business_id
    })
  
  if (error) {
    // 3. Solape check (exclusion constraint)
    if (error.code === '23P01' || error.message.includes('staff_shifts_overlap_exclude')) {
      throw new Error('Este trabajador ya tiene un turno de trabajo que se solapa en ese horario.')
    }
    throw new Error(`Error al crear turno: ${error.message}`)
  }
  
  revalidatePath(`/${finalLocale}/dashboard/team/${data.employee_id}`)
}

export async function deleteShiftAction(shiftId: string, employeeId: string, locale?: string) {
  const { profile, supabase } = await getAdminProfile()
  const finalLocale = await resolveLocale(locale)
  
  const { error } = await supabase
    .from('staff_shifts')
    .delete()
    .eq('id', shiftId)
    .eq('business_id', profile.business_id)
  
  if (error) throw new Error(`Error al eliminar turno: ${error.message}`)
  revalidatePath(`/${finalLocale}/dashboard/team/${employeeId}`)
}

/**
 * WORKER INVITATION & MANAGEMENT (Migrated from employees)
 */

export async function inviteWorkerAction(formData: FormData, locale?: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser) throw new Error('No autorizado')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', adminUser.id)
    .single()

  if (adminProfile?.role !== 'admin' && adminProfile?.role !== 'super_admin') {
    throw new Error('Solo los administradores pueden invitar trabajadores')
  }

  const email = formData.get('email') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const phone = formData.get('phone') as string
  const position = formData.get('position') as string
  const photo = formData.get('photo') as File | null

  if (!email || !firstName) {
    throw new Error('Email y nombre son obligatorios')
  }

  // 0. Resolve correct locale
  const finalLocale = await resolveLocale(locale)

  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`
  const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1')
  const siteUrl = isLocal ? origin : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mylocalcommerce.com')

  // 1. Invite User
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: `${firstName} ${lastName}`.trim(),
      business_id: adminProfile.business_id,
      first_name: firstName,
      last_name: lastName,
      locale: finalLocale
    },
    redirectTo: `${siteUrl}/${finalLocale}/auth/confirm?type=invite&next=/${finalLocale}/set-password`
  })

  if (inviteError) throw new Error(`Error al invitar: ${inviteError.message}`)

  const workerUserId = inviteData.user.id

  // 2. Handle Photo Upload
  let photoUrl = null
  if (photo && photo.size > 0) {
    if (photo.size > 200 * 1024) throw new Error('La foto no debe superar los 200KB')
    
    const fileExt = photo.name.split('.').pop()
    const fileName = `${workerUserId}/profile.${fileExt}`
    const { error: uploadError } = await adminClient.storage
      .from('profile-photos')
      .upload(fileName, photo, { upsert: true })

    if (uploadError) console.error('Error uploading photo:', uploadError)
    else {
      const { data: publicUrlData } = adminClient.storage
        .from('profile-photos')
        .getPublicUrl(fileName)
      photoUrl = publicUrlData.publicUrl
    }
  }

  // 3. Upsert Profile
  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      id: workerUserId,
      business_id: adminProfile.business_id,
      name: `${firstName} ${lastName}`.trim(),
      email: email,
      phone: phone,
      role: 'employee'
    }, { onConflict: 'id' })

  if (profileError) throw new Error(`Error al crear/actualizar perfil: ${profileError.message}`)

  // 4. Upsert Employee Record
  const { error: employeeError } = await adminClient
    .from('employees')
    .upsert({
      business_id: adminProfile.business_id,
      profile_id: workerUserId,
      name: `${firstName} ${lastName}`.trim(),
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      position: position,
      photo_url: photoUrl,
      status: 'invited'
    }, { onConflict: 'profile_id' })

  if (employeeError) throw new Error(`Error al crear/actualizar empleado: ${employeeError.message}`)

  revalidatePath(`/${finalLocale}/dashboard/team`)
  return { success: true }
}

export async function activateEmployeeAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('employees')
    .update({ status: 'active' })
    .eq('profile_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteEmployeeAction(employeeId: string, locale?: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser) throw new Error('No autorizado')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', adminUser.id)
    .single()

  if (adminProfile?.role !== 'admin' && adminProfile?.role !== 'super_admin') {
    throw new Error('Solo los administradores pueden eliminar trabajadores')
  }

  const { data: employee, error: getError } = await supabase
    .from('employees')
    .select('profile_id')
    .eq('id', employeeId)
    .eq('business_id', adminProfile.business_id)
    .single()

  if (getError || !employee) throw new Error('Empleado no encontrado')

  const profileId = employee.profile_id

  // 0. Resolve correct locale
  const finalLocale = await resolveLocale(locale)

  await supabase.from('tasks').update({ assigned_to: null }).eq('assigned_to', employeeId)
  await supabase.from('reservations').update({ employee_id: null }).eq('employee_id', employeeId)
  await supabase.from('staff_shifts').delete().eq('employee_id', employeeId)

  const { error: empError } = await supabase.from('employees').delete().eq('id', employeeId)
  if (empError) throw new Error(`Error al eliminar datos del trabajador: ${empError.message}`)

  if (profileId) {
    const { error: profileError } = await adminClient.from('profiles').delete().eq('id', profileId)
    if (profileError) console.warn(`Could not delete profile (might be deleted by cascade): ${profileError.message}`)

    const { error: authError } = await adminClient.auth.admin.deleteUser(profileId)
    if (authError) throw new Error(`Error al eliminar la cuenta de acceso: ${authError.message}`)
  }

  revalidatePath(`/${finalLocale}/dashboard/team`)
  return { success: true }
}

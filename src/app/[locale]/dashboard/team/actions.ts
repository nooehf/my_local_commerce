'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Global result type for Server Actions
 */
export type ActionResult<T> = {
  data: T;
  error: string | null;
}

/**
 * Helper to get admin profile and ensure authorization.
 * STRICT: Only 'admin' role allowed.
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
  
  // Guard admin estricto
  if (profile.role !== 'admin') {
    throw new Error('Solo los administradores pueden realizar esta acción')
  }

  return { profile, user, supabase }
}

/**
 * GETTERS (Typed with ActionResult)
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
 * MUTATIONS (Keep business logic)
 */

export async function assignServiceAction(employeeId: string, serviceId: string, locale: string) {
  const { profile, supabase } = await getAdminProfile()
  
  const { error } = await supabase
    .from('employee_services')
    .insert({
      business_id: profile.business_id,
      employee_id: employeeId,
      service_id: serviceId,
      is_active: true
    })
  
  if (error) throw new Error(`Error al asignar servicio: ${error.message}`)
  revalidatePath(`/${locale}/dashboard/team/${employeeId}`)
}

export async function unassignServiceAction(employeeId: string, serviceId: string, locale: string) {
  const { profile, supabase } = await getAdminProfile()
  
  const { error } = await supabase
    .from('employee_services')
    .delete()
    .eq('employee_id', employeeId)
    .eq('service_id', serviceId)
    .eq('business_id', profile.business_id)
  
  if (error) throw new Error(`Error al desasignar servicio: ${error.message}`)
  revalidatePath(`/${locale}/dashboard/team/${employeeId}`)
}

export async function updateServiceOverrideAction(
  employeeId: string, 
  serviceId: string, 
  overrides: { duration_minutes_override?: number | null, price_override?: number | null },
  locale: string
) {
  const { profile, supabase } = await getAdminProfile()
  
  const { error } = await supabase
    .from('employee_services')
    .update(overrides)
    .eq('employee_id', employeeId)
    .eq('service_id', serviceId)
    .eq('business_id', profile.business_id)
  
  if (error) throw new Error(`Error al actualizar overrides: ${error.message}`)
  revalidatePath(`/${locale}/dashboard/team/${employeeId}`)
}

export async function createShiftAction(data: {
  employee_id: string,
  start_at: string,
  end_at: string,
  type: 'work' | 'break' | 'time_off',
  notes?: string
}, locale: string) {
  const { profile, supabase } = await getAdminProfile()

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
  
  revalidatePath(`/${locale}/dashboard/team/${data.employee_id}`)
}

export async function deleteShiftAction(shiftId: string, employeeId: string, locale: string) {
  const { profile, supabase } = await getAdminProfile()
  
  const { error } = await supabase
    .from('staff_shifts')
    .delete()
    .eq('id', shiftId)
    .eq('business_id', profile.business_id)
  
  if (error) throw new Error(`Error al eliminar turno: ${error.message}`)
  revalidatePath(`/${locale}/dashboard/team/${employeeId}`)
}

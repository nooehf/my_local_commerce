'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { BusinessPeriod, BusinessHour, BusinessException } from './actions'

export interface EmployeePeriod extends BusinessPeriod {}

export interface EmployeeHour {
  id?: string
  employee_id: string
  day_of_week: number
  is_closed: boolean
  periods: EmployeePeriod[]
}

export interface EmployeeException {
  id?: string
  employee_id: string
  date: string
  is_closed: boolean
  reason: string | null
  periods: EmployeePeriod[]
}

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
  
  if (profile.role !== 'admin' && profile.role !== 'super_admin') {
    throw new Error('Solo los administradores pueden realizar esta acción')
  }

  return { profile, user, supabase }
}

export async function getEmployeeScheduleAction(employeeId: string) {
  try {
    const { profile, supabase } = await getAdminProfile()
    console.log(`[SCHEDULE] Fetching for employee ${employeeId} and business ${profile.business_id}`)

    // 1. Get Employee Template
    const { data: hours, error: hError } = await supabase
      .from('employee_weekly_hours')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('business_id', profile.business_id)

    // 2. Get Employee Exceptions
    const { data: exceptions, error: eError } = await supabase
      .from('employee_exceptions')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('business_id', profile.business_id)
      .order('date', { ascending: true })

    if (hError || eError) throw hError || eError

    return { 
      hours: hours || [], 
      exceptions: exceptions || [], 
      error: null 
    }
  } catch (err: any) {
    console.error('Error fetching employee schedule:', err)
    return { hours: [], exceptions: [], error: err.message }
  }
}

/**
 * Validation Logic: Ensures employee shift is within business hours
 */
async function validateAgainstBusinessHours(
  date: string, 
  periods: EmployeePeriod[], 
  isClosed: boolean,
  supabase: any,
  businessId: string
) {
  if (isClosed) return true // Closing is always allowed

  // 1. Get Business Schedule for that date
  const dayOfWeek = new Date(date).getDay()
  
  // Check Business Exceptions
  const { data: bEx } = await supabase
    .from('business_exceptions')
    .select('*')
    .eq('business_id', businessId)
    .eq('date', date)
    .single()

  let bPeriods: BusinessPeriod[] = []
  let bIsClosed = false

  if (bEx) {
    bIsClosed = bEx.is_closed
    bPeriods = bEx.periods || []
  } else {
    // Check Business Weekly Template
    const { data: bStd } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId)
      .eq('day_of_week', dayOfWeek)
      .single()
    
    bIsClosed = bStd ? bStd.is_closed : true
    bPeriods = bStd ? bStd.periods : []
  }

  if (bIsClosed) {
    throw new Error(`El negocio está CERRADO el ${date}. No se pueden asignar turnos.`)
  }

  // Check if each employee period is within business periods
  for (const ep of periods) {
    let covered = false
    for (const bp of bPeriods) {
      if (ep.open >= bp.open && ep.close <= bp.close) {
        covered = true
        break
      }
    }
    if (!covered) {
      throw new Error(`El turno ${ep.open.slice(0,5)}-${ep.close.slice(0,5)} está fuera del horario del negocio para ese día.`)
    }
  }

  return true
}

export async function updateEmployeeScheduleAction(
  employeeId: string,
  data: Partial<EmployeeHour | EmployeeException>,
  type: 'template' | 'exception',
  locale: string
) {
  try {
    const { profile, supabase } = await getAdminProfile()
    console.log(`[SCHEDULE] Updating ${type} for employee ${employeeId}. Data:`, JSON.stringify(data))

    // Validation (simplified for template vs date)
    if (type === 'exception') {
      const ex = data as EmployeeException
      await validateAgainstBusinessHours(ex.date, ex.periods, ex.is_closed, supabase, profile.business_id)
      
      const { error } = await supabase
        .from('employee_exceptions')
        .upsert({
          employee_id: employeeId,
          business_id: profile.business_id,
          date: ex.date,
          is_closed: ex.is_closed,
          reason: ex.reason,
          periods: ex.periods
        }, { onConflict: 'employee_id, date' })
      if (error) throw error
    } else {
      const hour = data as EmployeeHour
      // Template validation is trickier because it applies to ALL future dates.
      // We'll skip strict validation for the template but the UI should guide it.
      const { error } = await supabase
        .from('employee_weekly_hours')
        .upsert({
          employee_id: employeeId,
          business_id: profile.business_id,
          day_of_week: hour.day_of_week,
          is_closed: hour.is_closed,
          periods: hour.periods
        }, { onConflict: 'employee_id, day_of_week' })
      if (error) throw error
    }

    console.log(`[SCHEDULE] ${type} update SUCCESS for ${employeeId}`)
    revalidatePath(`/${locale}/dashboard/team/${employeeId}`)
    return { success: true, error: null }
  } catch (err: any) {
    console.error(`[SCHEDULE] Error updating ${type}:`, err)
    return { success: false, error: err.message || 'Error al guardar horario' }
  }
}

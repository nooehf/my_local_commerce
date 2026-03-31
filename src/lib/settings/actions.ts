'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BusinessPeriod {
  open: string
  close: string
}

export interface BusinessHour {
  day_of_week: number
  is_closed: boolean
  periods: BusinessPeriod[]
}

export interface BusinessException {
  id?: string
  date: string
  is_closed: boolean
  reason: string | null
  periods: BusinessPeriod[]
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

export async function getBusinessHoursAction() {
  try {
    const { profile, supabase } = await getAdminProfile()

    const { data: existingHours, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('day_of_week', { ascending: true })

    if (error) throw error

    // Ensure we return all 7 days even if not in DB
    const fullWeek: BusinessHour[] = Array.from({ length: 7 }, (_, i) => {
      const match = existingHours?.find(h => h.day_of_week === i)
      return match ? {
        day_of_week: match.day_of_week,
        is_closed: match.is_closed,
        periods: match.periods || []
      } : {
        day_of_week: i,
        is_closed: i === 0 || i === 6, // Default closed on weekends
        periods: [{ open: '09:00:00', close: '18:00:00' }]
      }
    })

    return { data: fullWeek, error: null }
  } catch (err: any) {
    console.error('Error fetching business hours:', err)
    return { data: null, error: err.message || 'Error al obtener horarios' }
  }
}

export async function updateBusinessHoursAction(hours: BusinessHour[], locale: string) {
  try {
    const { profile, supabase } = await getAdminProfile()

    const { error } = await supabase
      .from('business_hours')
      .upsert(
        hours.map(h => ({
          day_of_week: h.day_of_week,
          is_closed: h.is_closed,
          periods: h.periods,
          business_id: profile.business_id
        })),
        { onConflict: 'business_id, day_of_week' }
      )

    if (error) throw error

    revalidatePath(`/${locale}/dashboard/settings`)
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error updating business hours:', err)
    return { success: false, error: err.message || 'Error al actualizar horarios' }
  }
}

export async function getBusinessExceptionsAction() {
  try {
    const { profile, supabase } = await getAdminProfile()

    const { data, error } = await supabase
      .from('business_exceptions')
      .select('*')
      .eq('business_id', profile.business_id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (err: any) {
    console.error('Error fetching business exceptions:', err)
    return { data: [], error: err.message || 'Error al obtener excepciones' }
  }
}

export async function createExceptionAction(data: BusinessException, locale: string) {
  try {
    const { profile, supabase } = await getAdminProfile()

    const { error } = await supabase
      .from('business_exceptions')
      .upsert({
        date: data.date,
        is_closed: data.is_closed,
        reason: data.reason,
        periods: data.periods,
        business_id: profile.business_id
      }, { onConflict: 'business_id, date' })

    if (error) throw error

    revalidatePath(`/${locale}/dashboard/settings`)
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error creating business exception:', err)
    return { success: false, error: err.message || 'Error al crear excepción' }
  }
}

export async function deleteExceptionAction(id: string, locale: string) {
  try {
    const { profile, supabase } = await getAdminProfile()

    const { error } = await supabase
      .from('business_exceptions')
      .delete()
      .eq('id', id)
      .eq('business_id', profile.business_id)

    if (error) throw error

    revalidatePath(`/${locale}/dashboard/settings`)
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error deleting business exception:', err)
    return { success: false, error: err.message || 'Error al eliminar excepción' }
  }
}

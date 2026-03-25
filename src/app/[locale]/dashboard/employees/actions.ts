'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteWorkerAction(formData: FormData, locale: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser) throw new Error('No autorizado')

  // Verify admin role
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

  // 1. Invite User
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: `${firstName} ${lastName}`.trim(),
      business_id: adminProfile.business_id,
      first_name: firstName,
      last_name: lastName
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`
  })

  if (inviteError) throw new Error(`Error al invitar: ${inviteError.message}`)

  const workerUserId = inviteData.user.id

  // 2. Handle Photo Upload
  let photoUrl = null
  if (photo && photo.size > 0) {
    if (photo.size > 200 * 1024) throw new Error('La foto no debe superar los 200KB')
    
    const fileExt = photo.name.split('.').pop()
    const fileName = `${workerUserId}/profile.${fileExt}`
    const { data: uploadData, error: uploadError } = await adminClient.storage
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
      status: 'active'
    }, { onConflict: 'profile_id' })

  if (employeeError) throw new Error(`Error al crear/actualizar empleado: ${employeeError.message}`)

  revalidatePath(`/${locale}/dashboard/employees`)
  return { success: true }
}

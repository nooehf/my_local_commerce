'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export default function LogoutButton() {
  const router = useRouter()
  const t = useTranslations('Sidebar')
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="flex items-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors">
      <LogOut className="w-4 h-4 mr-2" />
      {t('logout')}
    </button>
  )
}

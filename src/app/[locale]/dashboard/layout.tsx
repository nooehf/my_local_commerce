import Sidebar from '@/components/dashboard/Sidebar'
import MobileMenuButton from '@/components/dashboard/MobileMenuButton'
import { Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user?.id || '')
    .single()

  const userName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const userRole = profile?.role || 'customer'

  return (
    <div className="flex h-screen w-full bg-slate-50/50">
      <Sidebar userName={userName} userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden w-full min-w-0">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-2 lg:gap-4">
            <MobileMenuButton />
            <Image 
              src="/logo.png" 
              alt="MyLocalCommerce" 
              width={160} 
              height={48} 
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors relative"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {/* Ejemplo de puntito indicador de notificaciones no leídas */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

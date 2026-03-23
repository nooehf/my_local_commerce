import Sidebar from '@/components/dashboard/Sidebar'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <div className="flex h-screen w-full bg-slate-50/50">
      <Sidebar userName={userName} />
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
          <Image 
            src="/logo.png" 
            alt="MyLocalCommerce" 
            width={200} 
            height={60} 
            className="object-contain"
          />
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Notificaciones
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

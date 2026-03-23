'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { usePathname } from '@/i18n/routing'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import LogoutButton from '@/components/ui/LogoutButton'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Briefcase,
  UsersRound,
  Clock,
  Package,
  CheckSquare,
  Settings,
  ChevronLeft
} from 'lucide-react'

const navigation = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'reservations', href: '/dashboard/reservations', icon: CalendarDays },
  { key: 'customers', href: '/dashboard/customers', icon: Users },
  { key: 'services', href: '/dashboard/services', icon: Briefcase },
  { key: 'employees', href: '/dashboard/employees', icon: UsersRound },
  { key: 'shifts', href: '/dashboard/shifts', icon: Clock },
  { key: 'inventory', href: '/dashboard/inventory', icon: Package },
  { key: 'tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar({ userName = 'Usuario' }: { userName?: string }) {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('Sidebar')

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('sidebar-open')
    if (saved !== null) {
      setIsOpen(JSON.parse(saved))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isOpen
    setIsOpen(newState)
    if (mounted) {
      localStorage.setItem('sidebar-open', JSON.stringify(newState))
    }
  }

  return (
    <div className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-300 h-full ${
      isOpen ? 'fixed left-0 top-0 w-64 z-40' : 'relative w-20'
    }`}>
      <div className={`flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-4`}>
        {isOpen && (
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={200} 
            height={60} 
            className="object-contain"
          />
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto p-2 text-slate-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-50"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                group flex items-center rounded-xl px-3 py-2.5 text-sm w-full font-medium transition-colors justify-center
                ${isOpen ? 'justify-start' : ''}
                ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
              title={!isOpen ? t(item.key) : undefined}
            >
              <item.icon
                className={`flex-shrink-0 transition-colors ${isOpen ? 'mr-3' : ''} h-5 w-5 ${
                  isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                }`}
                aria-hidden="true"
              />
              {isOpen && t(item.key)}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-slate-100 space-y-3">
        {isOpen && <LanguageSwitcher />}
        {isOpen && (
          <div className="flex items-center gap-3 w-full p-2">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 uppercase">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col text-sm truncate">
              <span className="font-medium text-slate-900 truncate">{userName}</span>
              <span className="text-slate-500 text-xs truncate">{t('owner')}</span>
            </div>
          </div>
        )}
        {isOpen && <LogoutButton />}
        {!isOpen && (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
              {userName.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { Menu } from 'lucide-react'

export default function MobileMenuButton() {
  return (
    <button 
      className="p-2 -ml-2 text-slate-600 hover:text-indigo-600 transition-colors rounded-xl hover:bg-slate-50 lg:hidden" 
      onClick={() => window.dispatchEvent(new Event('toggle-mobile-sidebar'))}
      aria-label="Menú principal"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}

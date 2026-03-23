'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const nav = useTranslations('Navigation');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Botón Hamburguesa */}
      <button
        onClick={toggleMenu}
        className="p-2 text-slate-600 hover:text-blue-600 transition-colors relative z-50"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="fixed top-16 left-0 right-0 w-full bg-white shadow-2xl z-40 md:hidden max-h-[calc(100vh-64px)] overflow-y-auto mobile-menu-open border-b-2 border-blue-500">
          <div className="w-full px-4 py-6 flex flex-col gap-1">
            {/* Enlaces de Navegación */}
            <Link
              href="#"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium py-3 px-4 hover:bg-slate-50 rounded-lg"
              onClick={closeMenu}
            >
              {nav("home")}
            </Link>
            <Link
              href="#features"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium py-3 px-4 hover:bg-slate-50 rounded-lg"
              onClick={closeMenu}
            >
              {nav('features')}
            </Link>
            <Link
              href="#pricing"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium py-3 px-4 hover:bg-slate-50 rounded-lg"
              onClick={closeMenu}
            >
              {nav('pricing')}
            </Link>
            <Link
              href="#contact"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium py-3 px-4 hover:bg-slate-50 rounded-lg"
              onClick={closeMenu}
            >
              {nav('contact')}
            </Link>

            {/* Separador */}
            <div className="my-4 border-t border-slate-200" />

            {/* Selector de Idioma */}
            <div className="px-4 py-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Idioma</p>
              <LanguageSwitcher />
            </div>

            {/* Separador */}
            <div className="my-4 border-t border-slate-200" />

            {/* Auth Links */}
            <Link
              href="/login"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium py-3 px-4 hover:bg-slate-50 rounded-lg"
              onClick={closeMenu}
            >
              {nav('login')}
            </Link>
            <Link
              href="/register"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg shadow-blue-200 transition-all font-semibold text-center"
              onClick={closeMenu}
            >
              {nav('register')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

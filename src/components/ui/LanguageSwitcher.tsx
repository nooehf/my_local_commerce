'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (lang: 'es' | 'en') => {
    if (locale !== lang) {
      router.replace(pathname, { locale: lang });
    }
  };

  return (
    <div
      className="relative flex items-center w-24 h-10 bg-slate-50 rounded-full border border-slate-200 shadow-inner px-1 select-none"
      style={{ minWidth: 80 }}
    >
      {/* Círculo deslizante */}
      <span
        className={`absolute top-1 left-1 w-9 h-8 rounded-full transition-all duration-300 ease-in-out shadow-md z-0 ${
          locale === 'es'
            ? 'translate-x-0'
            : 'translate-x-12'
        } bg-blue-500`}
        style={{
          willChange: 'transform',
        }}
      />
      {/* Opciones de idioma */}
      <button
        type="button"
        className={`relative z-10 flex-1 text-center text-sm font-semibold transition-colors duration-200 cursor-pointer ${
          locale === 'es' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
        }`}
        onClick={() => handleSwitch('es')}
        aria-pressed={locale === 'es'}
        style={{ minWidth: 32 }}
      >
        ES
      </button>
      <button
        type="button"
        className={`relative z-10 flex-1 text-center text-sm font-semibold transition-colors duration-200 cursor-pointer ${
          locale === 'en' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
        }`}
        onClick={() => handleSwitch('en')}
        aria-pressed={locale === 'en'}
        style={{ minWidth: 32 }}
      >
        EN
      </button>
    </div>
  );
}

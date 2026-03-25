import { Link } from "@/i18n/routing";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import MobileMenu from "@/components/MobileMenu";
import { useTranslations } from "next-intl";

export default function PublicNavbar() {
  const nav = useTranslations("Navigation");

  return (
    <header className="fixed w-full top-0 navbar-gradient-border bg-white/80 backdrop-blur-md z-50 border-b border-slate-200/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
          <img src="/logo.png" alt="MyLocalCommerce" className="h-8 md:h-10 w-auto" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">{nav("home")}</Link>
          <Link href="/#features" className="hover:text-blue-600 transition-colors">{nav("features")}</Link>
          <Link href="/#pricing" className="hover:text-blue-600 transition-colors">{nav("pricing")}</Link>
          <Link href="/#contact" className="hover:text-blue-600 transition-colors">{nav("contact")}</Link>
          <Link href="/map" className="hover:text-blue-600 transition-colors">{nav("businesses")}</Link>
        </nav>
        
        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <div className="w-32">
            <LanguageSwitcher />
          </div>
          <Link href="/login" className="text-slate-600 hover:text-blue-600 transition-colors">{nav("login")}</Link>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-sm transition-all hover:shadow-md">
            {nav("register")}
          </Link>
        </div>

        {/* Mobile Right Section */}
        <div className="md:hidden flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

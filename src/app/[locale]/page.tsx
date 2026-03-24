import { ArrowRight, Calendar, Users, BarChart } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import MobileMenu from "@/components/MobileMenu";
import ContactForm from "@/components/ContactForm";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("Landing");
  const nav = useTranslations("Navigation");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="fixed w-full top-0 navbar-gradient-border bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="#" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
            <img src="/logo.png" alt="MyLocalCommerce" className="h-8 md:h-10 w-auto" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-blue-600 transition-colors">{nav("home")}</Link>
            <Link href="#features" className="hover:text-blue-600 transition-colors">{nav("features")}</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">{nav("pricing")}</Link>
            <Link href="/map" className="hover:text-blue-600 transition-colors">Negocios</Link>
            <Link href="#contact" className="hover:text-blue-600 transition-colors">{nav("contact")}</Link>
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

      <main className="pt-20 md:pt-32 pb-8 md:pb-16">
        <section className="container mx-auto px-4 md:px-6 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4 md:mb-6">
            {t("title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">{t("titleHighlight")}</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-slate-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg font-medium px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
              {nav("register")} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 md:px-6 py-16 md:py-24 mt-4 md:mt-12">
          <div className="grid md:grid-cols-3 gap-6 md:gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{t("features.reservationsTitle")}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t("features.reservationsDesc")}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{t("features.loyaltyTitle")}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t("features.loyaltyDesc")}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{t("features.analyticsTitle")}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t("features.analyticsDesc")}
              </p>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">MyLocalCommerce</div>
          <p className="mb-6">{t("footerSubtitle")}</p>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} MyLocalCommerce Inc. {t("footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}

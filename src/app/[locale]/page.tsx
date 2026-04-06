import { ArrowRight, Calendar, Users, BarChart, Heart, Package, Gift, Megaphone } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import MobileMenu from "@/components/MobileMenu";
import PublicNavbar from "@/components/PublicNavbar";
import ContactForm from "@/components/ContactForm";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("Landing");
  const nav = useTranslations("Navigation");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <PublicNavbar />

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[
              {
                icon: Calendar,
                title: t("features.reservationsTitle"),
                desc: t("features.reservationsDesc"),
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                icon: Heart,
                title: t("features.loyaltyTitle"),
                desc: t("features.loyaltyDesc"),
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: BarChart,
                title: t("features.analyticsTitle"),
                desc: t("features.analyticsDesc"),
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Package,
                title: t("features.inventoryTitle"),
                desc: t("features.inventoryDesc"),
                color: "bg-amber-50 text-amber-600"
              },
              {
                icon: Users,
                title: t("features.teamTitle"),
                desc: t("features.teamDesc"),
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: Gift,
                title: t("features.loyaltyColabTitle"),
                desc: t("features.loyaltyColabDesc"),
                color: "bg-rose-50 text-rose-600"
              },
              {
                icon: Megaphone,
                title: t("features.marketplaceTitle"),
                desc: t("features.marketplaceDesc"),
                color: "bg-sky-50 text-sky-600"
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className={`bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow ${
                  i === 6 ? 'lg:col-start-2' : ''
                }`}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
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

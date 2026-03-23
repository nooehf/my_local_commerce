"use client";

import { useState } from "react";
import { Phone, MessageCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    contactMethod: "call",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactMethodChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      contactMethod: method,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend será implementado después
    console.log("Formulario de contacto:", formData);
  };

  return (
    <section id="contact" className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
            {t("badge")}
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 md:mb-4">
            {t("title")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              {t("highlight")}
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto">
            {t("description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-blue-100 p-6 md:p-8 lg:p-12">
          {/* Email Field */}
          <div className="mb-6 md:mb-8">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2 md:mb-3">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={t("emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Phone Field */}
          <div className="mb-6 md:mb-8">
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2 md:mb-3">
              {t("phoneLabel")}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder={t("phonePlaceholder")}
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Contact Method */}
          <div className="mb-8 md:mb-10">
            <label className="block text-sm font-semibold text-slate-900 mb-3 md:mb-4">
              {t("methodLabel")}
            </label>
            <div className="flex gap-4 flex-col sm:flex-row">
              <button
                type="button"
                onClick={() => handleContactMethodChange("call")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border-2 ${
                  formData.contactMethod === "call"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                }`}
              >
                <Phone className="w-5 h-5" />
                {t("callOption")}
              </button>
              <button
                type="button"
                onClick={() => handleContactMethodChange("whatsapp")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border-2 ${
                  formData.contactMethod === "whatsapp"
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                {t("whatsappOption")}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Send className="w-5 h-5" />
            {t("submitButton")}
          </button>
        </form>
      </div>
    </section>
  );
}

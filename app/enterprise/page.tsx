"use client";
import { useAppContext } from "@/components/AppContext";

export default function EnterprisePage() {
  const { language } = useAppContext();
  const t = {
    badge: "ENTERPRISE",
    title: language === "id" ? "Solusi untuk tim besar & perusahaan" : "Solutions for large teams & companies",
    subtitle: language === "id" ? "Ngumpul Enterprise hadir untuk kebutuhan koordinasi tim korporat skala besar dengan keamanan dan kontrol penuh." : "Ngumpul Enterprise is built for large corporate team coordination needs with full security and control.",
    features: language === "id"
      ? ["SSO (Single Sign-On) dengan SAML 2.0", "Dedicated workspace untuk setiap departemen", "Audit log dan compliance tools", "SLA 99.9% uptime guarantee", "Dedicated customer success manager", "Custom branding dan domain"]
      : ["SSO (Single Sign-On) with SAML 2.0", "Dedicated workspace for each department", "Audit log and compliance tools", "SLA 99.9% uptime guarantee", "Dedicated customer success manager", "Custom branding and domain"],
    ctaTitle: language === "id" ? "Hubungi tim sales kami" : "Contact our sales team",
    ctaSubtitle: language === "id" ? "Kami senang mendiskusikan kebutuhan spesifik organisasimu." : "We'd love to discuss your organization's specific needs.",
    ctaBtn: language === "id" ? "Hubungi Sales" : "Contact Sales",
  };
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">{t.badge}</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">{t.title}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">{t.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {t.features.map((f, i) => (
          <div key={i} className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{f}</span>
          </div>
        ))}
      </div>
      <div className="bg-indigo-600 rounded-3xl p-10 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">{t.ctaTitle}</h2>
        <p className="text-indigo-200 mb-6">{t.ctaSubtitle}</p>
        <a href="mailto:enterprise@ngumpul.app" className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
          {t.ctaBtn}
        </a>
      </div>
    </div>
  );
}

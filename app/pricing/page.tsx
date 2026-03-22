"use client";
import { useAppContext } from "@/components/AppContext";
import { Check } from "lucide-react";

const plans = [
  {
    nameId: "Gratis", nameEn: "Free",
    priceId: "Rp0", priceEn: "$0",
    periodId: "selamanya", periodEn: "forever",
    color: "border-zinc-200 dark:border-zinc-800",
    badge: null,
    featuresId: ["Buat hingga 5 event per bulan", "Hingga 20 peserta per event", "Bagikan link undangan", "Heatmap ketersediaan", "Voting lokasi"],
    featuresEn: ["Create up to 5 events per month", "Up to 20 participants per event", "Share invitation links", "Availability heatmap", "Location voting"],
    btnId: "Mulai Gratis", btnEn: "Start Free",
    btnClass: "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100",
  },
  {
    nameId: "Pro", nameEn: "Pro",
    priceId: "Rp49.000", priceEn: "$4",
    periodId: "/bulan", periodEn: "/month",
    color: "border-indigo-500 ring-2 ring-indigo-500/20",
    badge: "POPULER",
    featuresId: ["Event & peserta tak terbatas", "Manajemen tim & workspace", "Integrasi Google Calendar", "Integrasi Apple Calendar", "Notifikasi real-time", "Export ke Slack & WhatsApp", "Prioritas support"],
    featuresEn: ["Unlimited events & participants", "Team management & workspaces", "Google Calendar integration", "Apple Calendar integration", "Real-time notifications", "Export to Slack & WhatsApp", "Priority support"],
    btnId: "Mulai Pro", btnEn: "Start Pro",
    btnClass: "bg-indigo-600 text-white hover:bg-indigo-700",
  },
];

export default function PricingPage() {
  const { language } = useAppContext();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">HARGA</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          {language === "id" ? "Harga yang jelas & transparan" : "Clear & transparent pricing"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          {language === "id" ? "Mulai gratis. Upgrade kapan saja saat kamu butuh lebih." : "Start free. Upgrade anytime when you need more."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan, i) => (
          <div key={i} className={`relative bg-white dark:bg-zinc-900 rounded-3xl border p-8 ${plan.color}`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-full tracking-wider">
                {plan.badge}
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{language === "id" ? plan.nameId : plan.nameEn}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-zinc-900 dark:text-white">{language === "id" ? plan.priceId : plan.priceEn}</span>
                <span className="text-zinc-400 text-sm">{language === "id" ? plan.periodId : plan.periodEn}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {(language === "id" ? plan.featuresId : plan.featuresEn).map((f, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.btnClass}`}>
              {language === "id" ? plan.btnId : plan.btnEn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

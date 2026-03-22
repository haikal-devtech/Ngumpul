"use client";
import { useAppContext } from "@/components/AppContext";

const roles = [
  { roleId: "Frontend Engineer", roleEn: "Frontend Engineer", typeId: "Full-time · Remote", typeEn: "Full-time · Remote" },
  { roleId: "Product Designer", roleEn: "Product Designer", typeId: "Full-time · Jakarta / Remote", typeEn: "Full-time · Jakarta / Remote" },
  { roleId: "Backend Engineer", roleEn: "Backend Engineer", typeId: "Full-time · Remote", typeEn: "Full-time · Remote" },
];

export default function CareersPage() {
  const { language } = useAppContext();
  const t = {
    badge: "KARIR",
    title: language === "id" ? "Bergabunglah dengan kami" : "Join our team",
    subtitle: language === "id" ? "Kami mencari orang-orang yang peduli dengan desain, teknologi, dan dampak sosial." : "We're looking for people who care about design, technology, and social impact.",
    openRoles: language === "id" ? "Posisi Terbuka" : "Open Positions",
    apply: language === "id" ? "Lamar Sekarang" : "Apply Now",
    noRoleTitle: language === "id" ? "Tidak menemukan posisi yang cocok?" : "Don't see a matching position?",
    noRoleDesc: language === "id" ? "Kirim CV dan portfolio kamu ke careers@ngumpul.app — kami selalu tertarik untuk bertemu orang berbakat." : "Send your CV and portfolio to careers@ngumpul.app — we're always interested in meeting talented people.",
  };
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">{t.badge}</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">{t.title}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">{t.subtitle}</p>
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{t.openRoles}</h2>
      <div className="space-y-4 mb-12">
        {roles.map((r, i) => (
          <div key={i} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">{language === "id" ? r.roleId : r.roleEn}</h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">{language === "id" ? r.typeId : r.typeEn}</p>
            </div>
            <a href="mailto:careers@ngumpul.app" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">{t.apply} →</a>
          </div>
        ))}
      </div>
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 p-8 text-center">
        <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{t.noRoleTitle}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.noRoleDesc}</p>
      </div>
    </div>
  );
}

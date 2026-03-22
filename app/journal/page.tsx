"use client";
import { useAppContext } from "@/components/AppContext";

const posts = [
  { dateId: "20 Mar 2026", dateEn: "Mar 20, 2026", titleId: "Mengapa 'Terserah' adalah Jawaban Terburuk untuk Rencana Kumpul", titleEn: "Why 'Up to You' is the Worst Answer for Gathering Plans", tagId: "Tips", tagEn: "Tips" },
  { dateId: "15 Mar 2026", dateEn: "Mar 15, 2026", titleId: "Psikologi di Balik Rencana yang Selalu Batal", titleEn: "The Psychology Behind Plans That Always Fall Through", tagId: "Insight", tagEn: "Insight" },
  { dateId: "8 Mar 2026", dateEn: "Mar 8, 2026", titleId: "Cara Merencanakan Reuni yang Benar-Benar Jadi", titleEn: "How to Plan a Reunion That Actually Happens", tagId: "Panduan", tagEn: "Guide" },
];

export default function JournalPage() {
  const { language } = useAppContext();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">JURNAL</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          {language === "id" ? "Tulisan dari Ngumpul" : "Writing from Ngumpul"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {language === "id" ? "Tips, insight, dan cerita tentang seni berkumpul bersama." : "Tips, insights, and stories about the art of gathering together."}
        </p>
      </div>
      <div className="space-y-6">
        {posts.map((post, i) => (
          <div key={i} className="group bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{language === "id" ? post.tagId : post.tagEn}</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{language === "id" ? post.dateId : post.dateEn}</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
              {language === "id" ? post.titleId : post.titleEn}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

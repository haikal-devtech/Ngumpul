"use client";
import { useAppContext } from "@/components/AppContext";

export default function AboutPage() {
  const { language } = useAppContext();
  const t = {
    badge: "TENTANG KAMI",
    title: language === "id" ? "Kami percaya bahwa waktu bersama itu berharga." : "We believe time together is precious.",
    p1: language === "id"
      ? "Ngumpul lahir dari frustrasi yang sama: betapa susahnya mengkoordinir waktu untuk bertemu dengan orang-orang yang kita sayangi. Chat yang panjang, polling yang tidak pernah selesai, dan rencana yang berakhir jadi wacana."
      : "Ngumpul was born from a shared frustration: how hard it is to coordinate time to meet with the people we care about. Long chats, endless polls, and plans that never happen.",
    p2: language === "id"
      ? "Kami membangun Ngumpul dengan filosofi The Fluid Collective — bahwa teknologi harusnya menghilangkan gesekan, bukan menambahnya. Setiap fitur kami dirancang dengan satu tujuan: membuat momen berkumpul menjadi lebih mudah terwujud."
      : "We built Ngumpul with The Fluid Collective philosophy — that technology should remove friction, not add it. Every feature is designed with one goal: making moments of gathering easier to realize.",
    teamTitle: language === "id" ? "Dibuat oleh The Fluid Collective" : "Built by The Fluid Collective",
    teamDesc: language === "id" ? "Sebuah tim kecil yang percaya bahwa desain yang baik dan teknologi yang tepat dapat mengubah cara manusia terhubung satu sama lain." : "A small team that believes good design and the right technology can change how humans connect with each other.",
  };
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">{t.badge}</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-8 leading-tight">{t.title}</h1>
        <div className="space-y-6 text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
        </div>
      </div>
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800/30">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{t.teamTitle}</h2>
        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{t.teamDesc}</p>
      </div>
    </div>
  );
}

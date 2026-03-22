"use client";
import { useAppContext } from "@/components/AppContext";

const integrations = [
  { name: "Google Calendar", icon: "🗓️", descId: "Tambahkan acara yang dikonfirmasi langsung ke Google Calendar semua peserta.", descEn: "Add confirmed events directly to all participants' Google Calendar." },
  { name: "Apple Calendar", icon: "🍎", descId: "Ekspor acara ke Apple Calendar dengan satu klik via file .ics.", descEn: "Export events to Apple Calendar with one click via .ics file." },
  { name: "WhatsApp", icon: "💬", descId: "Bagikan link undangan langsung ke grup WhatsApp.", descEn: "Share invitation links directly to WhatsApp groups." },
  { name: "Telegram", icon: "✈️", descId: "Kirim link acara ke channel atau grup Telegram.", descEn: "Send event links to Telegram channels or groups." },
  { name: "Slack", icon: "⚡", descId: "Integrasikan Ngumpul ke workspace Slack kamu.", descEn: "Integrate Ngumpul into your Slack workspace." },
  { name: "Google Meet", icon: "📹", descId: "Otomatis buat link Google Meet untuk acara online.", descEn: "Automatically create Google Meet links for online events." },
  { name: "Zoom", icon: "🎥", descId: "Tambahkan link Zoom ke undangan acaramu.", descEn: "Add Zoom links to your event invitations." },
  { name: "Microsoft Teams", icon: "🏢", descId: "Sinkronisasi dengan Microsoft Teams untuk tim korporat.", descEn: "Sync with Microsoft Teams for corporate teams." },
];

export default function IntegrationsPage() {
  const { language } = useAppContext();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">INTEGRASI</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          {language === "id" ? "Terhubung ke semua tools-mu" : "Connect to all your tools"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          {language === "id" ? "Ngumpul bekerja secara mulus dengan aplikasi yang sudah kamu gunakan setiap hari." : "Ngumpul works seamlessly with the apps you already use every day."}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {integrations.map((item, i) => (
          <div key={i} className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-md text-center">
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{item.name}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{language === "id" ? item.descId : item.descEn}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

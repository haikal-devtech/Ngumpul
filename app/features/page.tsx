"use client";
import { useAppContext } from "@/components/AppContext";
import { Calendar, Share2, MapPin, Users, Clock, Zap, Bell, Globe } from "lucide-react";

const features = [
  { icon: Calendar, titleId: "Heatmap Ketersediaan", titleEn: "Availability Heatmap", descId: "Lihat kapan semua orang benar-benar luang dengan visualisasi warna intuitif.", descEn: "See when everyone is truly free with an intuitive color visualization." },
  { icon: Share2, titleId: "Link Sekali Klik", titleEn: "One-Click Link", descId: "Bagikan link undangan ke WhatsApp, Telegram, atau media sosial apapun.", descEn: "Share invitation links to WhatsApp, Telegram, or any social media." },
  { icon: MapPin, titleId: "Voting Lokasi", titleEn: "Location Voting", descId: "Berikan beberapa opsi tempat dan biarkan demokrasi bekerja secara demokratis.", descEn: "Provide location options and let everyone vote on their favorite." },
  { icon: Users, titleId: "Manajemen Tim", titleEn: "Team Management", descId: "Buat workspace tim untuk berkolaborasi dalam merencanakan berbagai acara.", descEn: "Create team workspaces to collaborate on planning multiple events." },
  { icon: Clock, titleId: "Konfirmasi Waktu Final", titleEn: "Final Time Confirmation", descId: "Host dapat mengkonfirmasi slot waktu terbaik dan memberitahu semua peserta.", descEn: "Hosts can confirm the best time slot and notify all participants." },
  { icon: Zap, titleId: "Tanpa Perlu Install", titleEn: "No Install Required", descId: "Peserta bisa mengisi jadwal tanpa perlu mendaftar atau install aplikasi.", descEn: "Participants can fill schedules without needing to register or install anything." },
  { icon: Bell, titleId: "Notifikasi Real-time", titleEn: "Real-time Notifications", descId: "Dapatkan pemberitahuan saat peserta baru bergabung atau jadwal dikonfirmasi.", descEn: "Get notified when new participants join or a schedule is confirmed." },
  { icon: Globe, titleId: "Multi Bahasa", titleEn: "Multi Language", descId: "Tersedia dalam Bahasa Indonesia dan English, sesuai preferensimu.", descEn: "Available in Bahasa Indonesia and English, based on your preference." },
];

export default function FeaturesPage() {
  const { language } = useAppContext();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">FITUR</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          {language === "id" ? "Semua yang kamu butuhkan" : "Everything you need"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          {language === "id" ? "Ngumpul dirancang untuk menghilangkan semua gesekan dalam merencanakan pertemuan sosial." : "Ngumpul is designed to eliminate all friction in planning social gatherings."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <div key={i} className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <f.icon size={20} />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{language === "id" ? f.titleId : f.titleEn}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{language === "id" ? f.descId : f.descEn}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

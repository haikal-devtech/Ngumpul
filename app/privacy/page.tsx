"use client";
import { useAppContext } from "@/components/AppContext";

export default function PrivacyPage() {
  const { language } = useAppContext();
  const t = {
    title: language === "id" ? "Kebijakan Privasi" : "Privacy Policy",
    updated: language === "id" ? "Terakhir diperbarui: 20 Maret 2026" : "Last updated: March 20, 2026",
    sections: language === "id" ? [
      { h: "1. Data yang Kami Kumpulkan", p: "Kami mengumpulkan informasi yang kamu berikan saat mendaftar, seperti nama, alamat email, dan foto profil dari akun Google kamu. Kami juga mengumpulkan data penggunaan seperti event yang kamu buat dan ketersediaan yang kamu isi." },
      { h: "2. Bagaimana Kami Menggunakan Data", p: "Data kamu digunakan untuk menyediakan dan meningkatkan layanan Ngumpul, mengirimkan notifikasi terkait event, dan mempersonalisasi pengalamanmu di platform." },
      { h: "3. Berbagi Data", p: "Kami tidak menjual data pribadi kamu kepada pihak ketiga. Data ketersediaanmu hanya dibagikan ke peserta dalam event yang sama sesuai pilihanmu." },
      { h: "4. Keamanan Data", p: "Kami menggunakan enkripsi standar industri untuk melindungi data kamu. Semua data disimpan di server yang aman dengan akses terbatas." },
      { h: "5. Hak Kamu", p: "Kamu berhak mengakses, memperbarui, atau menghapus data pribadi kamu kapan saja. Hubungi kami di privacy@ngumpul.app untuk permintaan terkait data." },
    ] : [
      { h: "1. Data We Collect", p: "We collect information you provide when registering, such as name, email address, and profile photo from your Google account. We also collect usage data such as events you create and availability you fill." },
      { h: "2. How We Use Data", p: "Your data is used to provide and improve Ngumpul's services, send event-related notifications, and personalize your platform experience." },
      { h: "3. Data Sharing", p: "We do not sell your personal data to third parties. Your availability data is only shared with participants in the same event based on your choices." },
      { h: "4. Data Security", p: "We use industry-standard encryption to protect your data. All data is stored on secure servers with limited access." },
      { h: "5. Your Rights", p: "You have the right to access, update, or delete your personal data at any time. Contact us at privacy@ngumpul.app for data-related requests." },
    ],
  };
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">{t.title}</h1>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-10">{t.updated}</p>
      <div className="space-y-8">
        {t.sections.map((s, i) => (
          <div key={i}>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{s.h}</h2>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

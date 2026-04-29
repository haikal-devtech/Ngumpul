"use client";
import { useAppContext } from "@/components/AppContext";

export default function TermsPage() {
  const { language } = useAppContext();
  const t = {
    title: language === "id" ? "Syarat & Ketentuan" : "Terms of Service",
    updated: language === "id" ? "Terakhir diperbarui: 20 Maret 2026" : "Last updated: March 20, 2026",
    sections: language === "id" ? [
      { h: "1. Penerimaan Syarat", p: "Dengan menggunakan Ngumpul, kamu menyetujui syarat dan ketentuan ini. Jika tidak setuju, mohon untuk tidak menggunakan layanan kami." },
      { h: "2. Penggunaan Layanan", p: "Ngumpul boleh digunakan untuk tujuan pribadi dan bisnis yang sah. Kamu bertanggung jawab atas semua aktivitas yang terjadi di akun kamu." },
      { h: "3. Konten Pengguna", p: "Kamu mempertahankan kepemilikan konten yang kamu buat. Dengan menggunakan Ngumpul, kamu memberi kami lisensi terbatas untuk menampilkan dan mendistribusikan konten tersebut dalam layanan kami." },
      { h: "4. Pembatasan", p: "Kamu dilarang menggunakan Ngumpul untuk aktivitas ilegal, menyebarkan spam, atau mengganggu pengguna lain. Pelanggaran dapat menyebabkan penghapusan akun." },
      { h: "5. Perubahan Layanan", p: "Kami berhak mengubah atau menghentikan layanan kapan saja dengan pemberitahuan yang wajar. Kami tidak bertanggung jawab atas kerugian yang timbul dari perubahan tersebut." },
    ] : [
      { h: "1. Acceptance of Terms", p: "By using Ngumpul, you agree to these terms and conditions. If you disagree, please refrain from using our service." },
      { h: "2. Service Usage", p: "Ngumpul may be used for legitimate personal and business purposes. You are responsible for all activities that occur in your account." },
      { h: "3. User Content", p: "You retain ownership of content you create. By using Ngumpul, you grant us a limited license to display and distribute that content within our service." },
      { h: "4. Restrictions", p: "You are prohibited from using Ngumpul for illegal activities, spreading spam, or harassing other users. Violations may result in account deletion." },
      { h: "5. Service Changes", p: "We reserve the right to modify or discontinue the service at any time with reasonable notice. We are not liable for losses arising from such changes." },
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

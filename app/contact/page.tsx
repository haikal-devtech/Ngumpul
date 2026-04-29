"use client";
import { useState } from "react";
import { useAppContext } from "@/components/AppContext";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export default function ContactPage() {
  const { language } = useAppContext();
  const [sent, setSent] = useState(false);
  const t = {
    badge: "KONTAK",
    title: language === "id" ? "Ada pertanyaan? Kami siap membantu." : "Have a question? We're here to help.",
    nameLabel: language === "id" ? "Nama" : "Name",
    emailLabel: language === "id" ? "Email" : "Email",
    msgLabel: language === "id" ? "Pesan" : "Message",
    msgPlaceholder: language === "id" ? "Tulis pesanmu di sini..." : "Write your message here...",
    sendBtn: language === "id" ? "Kirim Pesan" : "Send Message",
    sentTitle: language === "id" ? "Pesan terkirim! 🎉" : "Message sent! 🎉",
    sentDesc: language === "id" ? "Kami akan membalas dalam 1–2 hari kerja." : "We'll reply within 1–2 business days.",
  };
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4">{t.badge}</div>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-6 leading-tight">{t.title}</h1>
          <div className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-3"><Mail size={16} className="text-indigo-500" /><a href="mailto:hello@ngumpul.app" className="hover:text-indigo-600 transition-colors">hello@ngumpul.app</a></div>
            <div className="flex items-center gap-3"><MessageSquare size={16} className="text-indigo-500" /><span>@ngumpulapp</span></div>
            <div className="flex items-center gap-3"><MapPin size={16} className="text-indigo-500" /><span>Jakarta, Indonesia</span></div>
          </div>
        </div>
        <div>
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t.sentTitle}</h2>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">{t.sentDesc}</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t.nameLabel}</label>
                <input required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t.emailLabel}</label>
                <input required type="email" className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t.msgLabel}</label>
                <textarea required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-32 resize-none" placeholder={t.msgPlaceholder} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">{t.sendBtn}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

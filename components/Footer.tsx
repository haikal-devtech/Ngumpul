"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';

export const Footer = ({ onNavigate, language }: { onNavigate: (view: string) => void, language: 'en' | 'id' }) => {
  const t = {
    desc: language === 'id' ? 'Filosofi The Fluid Collective: menyatukan orang-orang melalui desain dan teknologi yang disengaja.' : 'The Fluid Collective philosophy: bringing people together through intentional design and technology.',
    product: language === 'id' ? 'Produk' : 'Product',
    features: language === 'id' ? 'Fitur' : 'Features',
    integrations: language === 'id' ? 'Integrasi' : 'Integrations',
    enterprise: language === 'id' ? 'Perusahaan' : 'Enterprise',
    pricing: language === 'id' ? 'Harga' : 'Pricing',
    company: language === 'id' ? 'Perusahaan' : 'Company',
    about: language === 'id' ? 'Tentang Kami' : 'About Us',
    careers: language === 'id' ? 'Karir' : 'Careers',
    journal: language === 'id' ? 'Jurnal' : 'Journal',
    contact: language === 'id' ? 'Kontak' : 'Contact',
    subscribe: language === 'id' ? 'Berlangganan' : 'Subscribe',
    subDesc: language === 'id' ? 'Dapatkan tips cara mengatur kumpul-kumpul terbaik.' : 'Get tips on how to organize the best gatherings.',
    email: language === 'id' ? 'Alamat email' : 'Email address',
    privacy: language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy',
    terms: language === 'id' ? 'Syarat Ketentuan' : 'Terms of Service',
  };

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Ngumpul</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
            {t.desc}
          </p>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><span className="text-xs font-bold">W</span></div>
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><span className="text-xs font-bold">In</span></div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-zinc-900 dark:text-white mb-4">{t.product}</h4>
          <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
            <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-600 transition-colors">{t.features}</button></li>
            <li><button onClick={() => onNavigate('integrations')} className="hover:text-indigo-600 transition-colors">{t.integrations}</button></li>
            <li><button onClick={() => onNavigate('enterprise')} className="hover:text-indigo-600 transition-colors">{t.enterprise}</button></li>
            <li><button onClick={() => onNavigate('pricing')} className="hover:text-indigo-600 transition-colors">{t.pricing}</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-zinc-900 dark:text-white mb-4">{t.company}</h4>
          <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
            <li><button onClick={() => onNavigate('about')} className="hover:text-indigo-600 transition-colors">{t.about}</button></li>
            <li><button onClick={() => onNavigate('careers')} className="hover:text-indigo-600 transition-colors">{t.careers}</button></li>
            <li><button onClick={() => onNavigate('journal')} className="hover:text-indigo-600 transition-colors">{t.journal}</button></li>
            <li><button onClick={() => onNavigate('contact')} className="hover:text-indigo-600 transition-colors">{t.contact}</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-zinc-900 dark:text-white mb-4">{t.subscribe}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{t.subDesc}</p>
          <div className="flex">
            <input type="email" placeholder={t.email} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-l-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-indigo-500" />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 font-medium uppercase tracking-wider">
        <p>© 2024 NGUMPUL - THE FLUID COLLECTIVE.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <button onClick={() => onNavigate('privacy')} className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">{t.privacy}</button>
          <button onClick={() => onNavigate('terms')} className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">{t.terms}</button>
        </div>
      </div>
    </footer>
  );
};

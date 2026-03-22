"use client";

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, ChevronLeft, Plus, Share2, Check, UserCircle, LogOut, CheckCircle, Mail, Lock, Key, Camera, Trash2, Sun, Moon, Search, Bell } from 'lucide-react';
import { format, addDays, startOfDay, eachDayOfInterval, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { NgumpulEvent, Participant, UserProfile, Team } from '../lib/types';
import { cn } from '../lib/utils';

// --- Components ---

export const Navbar = ({ 
  view,
  onNavigate,
  hasEvents, 
  currentUser, 
  theme, 
  toggleTheme, 
  onCreate,
  language,
  setLanguage
}: { 
  view: string,
  onNavigate: (view: string) => void,
  hasEvents: boolean, 
  currentUser: UserProfile | null, 
  theme: 'light' | 'dark', 
  toggleTheme: () => void, 
  onCreate: () => void,
  language: 'en' | 'id',
  setLanguage: (lang: 'en' | 'id') => void
}) => {
  const navItems = [
    { id: 'landing', label: language === 'id' ? 'Beranda' : 'Home' },
    ...(hasEvents ? [{ id: 'dashboard', label: language === 'id' ? 'Acara Saya' : 'My Events' }] : []),
    { id: 'calendar', label: language === 'id' ? 'Kalender' : 'Calendar' },
    { id: 'teams', label: language === 'id' ? 'Tim' : 'Teams' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 sm:px-6 py-3 flex justify-between items-center transition-colors">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <span className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-500">Ngumpul</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400 relative">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative px-1 py-2 transition-colors",
                view === item.id ? "text-indigo-600 dark:text-indigo-400" : "hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {item.label}
              {view === item.id && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full px-4 py-2">
          <Search size={16} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder={language === 'id' ? "Cari acara..." : "Search events..."}
            className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
          <button 
            onClick={() => setLanguage('en')}
            className={cn("px-2 py-1 text-xs font-bold rounded-full transition-colors", language === 'en' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400")}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('id')}
            className={cn("px-2 py-1 text-xs font-bold rounded-full transition-colors", language === 'id' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400")}
          >
            ID
          </button>
        </div>

        <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
          <Bell size={20} />
        </button>

        <button 
          onClick={toggleTheme} 
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ y: -20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </motion.div>
          </AnimatePresence>
        </button>

        {currentUser ? (
          <div className="flex items-center gap-3 cursor-pointer ml-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full transition-colors border border-zinc-200 dark:border-zinc-700" onClick={() => onNavigate('profile')}>
            <img src={currentUser.photoUrl} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
            <span className="text-sm font-bold hidden md:block dark:text-white">{currentUser.name}</span>
          </div>
        ) : (
          <button onClick={() => onNavigate('login')} className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ml-2">
            {language === 'id' ? 'Masuk' : 'Login'}
          </button>
        )}

        <button 
          onClick={onCreate}
          className="hidden sm:flex bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          {language === 'id' ? 'Buat Acara' : 'Create Event'}
        </button>
      </div>
    </nav>
  );
};

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

export const LandingPage = ({ onCreate, onNavigate, language }: { onCreate: () => void, onNavigate: (view: string) => void, language: 'en' | 'id' }) => {
  const t = {
    badge: language === 'id' ? 'KUMPUL JADI LEBIH MUDAH' : 'GATHERING MADE EASY',
    title1: language === 'id' ? 'Jadwalkan ' : 'Schedule ',
    title2: language === 'id' ? 'kumpul' : 'hangouts',
    title3: language === 'id' ? ' bareng ' : ' ',
    title4: language === 'id' ? 'tanpa ribet.' : 'without the hassle.',
    desc: language === 'id' 
      ? 'Satu aplikasi untuk menentukan waktu, lokasi, dan siapa yang bisa hadir. Berhenti melakukan polling manual di grup chat yang berujung wacana.'
      : 'One app to decide the time, location, and who can attend. Stop doing manual polls in group chats that never happen.',
    btnCreate: language === 'id' ? 'Buat Event Baru' : 'Create New Event',
    btnHow: language === 'id' ? 'Cara Kerja' : 'How it Works',
    cardTitle: language === 'id' ? 'Wacana Coffee Catch-up' : 'Coffee Catch-up Plan',
    cardLoc: language === 'id' ? 'The Fluid Collective Lab, Jakarta' : 'The Fluid Collective Lab, Jakarta',
    widget1Title: language === 'id' ? 'Siapa yang luang?' : "Who's free?",
    widget1Desc: language === 'id' ? '6 Orang Konfirmasi' : '6 People Confirmed',
    widget2Title: language === 'id' ? 'Tempat Terfavorit' : 'Top Voted Place',
    widget2Desc: language === 'id' ? '12 Suara' : '12 Votes',
    featTitle: language === 'id' ? 'Semua terkendali dalam satu dashboard' : 'Everything under control in one dashboard',
    featDesc: language === 'id' ? 'Kami mendesain Ngumpul untuk menghilangkan gesekan saat merencanakan kegiatan sosial.' : 'We designed Ngumpul to remove friction when planning social activities.',
    feat1Title: language === 'id' ? 'Heatmap Ketersediaan' : 'Availability Heatmap',
    feat1Desc: language === 'id' ? 'Lihat kapan semua orang benar-benar luang. Algoritma kami menyoroti slot waktu terbaik secara otomatis menggunakan visualisasi "Deep Purple".' : 'See when everyone is truly free. Our algorithm automatically highlights the best time slots using "Deep Purple" visualization.',
    feat2Title: language === 'id' ? 'Link Sekali Klik' : 'One-Click Link',
    feat2Desc: language === 'id' ? 'Bagikan link undangan ke WhatsApp, Telegram, atau Slack. Temanmu tidak perlu install aplikasi untuk memberikan suara.' : 'Share invitation links to WhatsApp, Telegram, or Slack. Your friends don\'t need to install the app to vote.',
    feat3Title: language === 'id' ? 'Voting Lokasi' : 'Location Voting',
    feat3Desc: language === 'id' ? 'Berikan beberapa opsi tempat dan biarkan demokrasi bekerja. Tidak ada lagi perdebatan panjang "Terserah mau kemana".' : 'Provide a few place options and let democracy work. No more long debates of "Up to you where to go".',
    feat4Title: language === 'id' ? 'Integrasi Kalender' : 'Calendar Integration',
    feat4Desc: language === 'id' ? 'Setelah waktu disepakati, Ngumpul secara otomatis menambahkan event ke Google Calendar atau Apple Calendar semua peserta.' : 'Once the time is agreed upon, Ngumpul automatically adds the event to everyone\'s Google Calendar or Apple Calendar.',
    stat1: language === 'id' ? 'Event Dibuat' : 'Events Created',
    stat2: language === 'id' ? 'Pengguna Aktif' : 'Active Users',
    stat3: language === 'id' ? 'Wacana Jadi Realita' : 'Plans Made Real',
    stat4: language === 'id' ? 'Rata-rata Penentuan' : 'Avg. Decision Time',
    ctaTitle1: language === 'id' ? 'Siap mengubah wacana' : 'Ready to turn plans',
    ctaTitle2: language === 'id' ? 'menjadi ' : 'into ',
    ctaTitle3: language === 'id' ? 'momen nyata?' : 'real moments?',
    ctaBtn: language === 'id' ? 'Buat Event Sekarang' : 'Create Event Now',
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 font-sans pt-20">
      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-6">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {t.badge}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-6">
            {t.title1}<span className="text-indigo-600 dark:text-indigo-500">{t.title2}</span>{t.title3}<span className="text-indigo-600 dark:text-indigo-500">{t.title4}</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg leading-relaxed">
            {t.desc}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onCreate}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {t.btnCreate} <ChevronRight size={18} />
            </button>
            <button className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">
              {t.btnHow}
            </button>
          </div>
        </div>
        
        {/* Right side graphic */}
        <div className="relative w-full aspect-square max-w-lg mx-auto lg:ml-auto">
          {/* Main Image Card */}
          <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" alt="Friends gathering" className="w-full h-3/5 object-cover" />
            <div className="p-6 bg-white dark:bg-zinc-900 flex-1 flex flex-col relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Oct</span>
                <span className="text-lg font-black leading-none">24</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{t.cardTitle}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-4">
                <MapPin size={14} /> {t.cardLoc}
              </p>
              <div className="mt-auto">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Peak Availability</div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-3/4 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Widget 1: Who's free */}
          <div className="absolute -top-6 -left-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 w-64 z-10 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">{t.widget1Title}</span>
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-zinc-900"></div>
                <div className="w-4 h-4 rounded-full bg-indigo-500 border border-white dark:border-zinc-900"></div>
                <div className="w-4 h-4 rounded-full bg-amber-500 border border-white dark:border-zinc-900"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="h-6 rounded bg-emerald-600"></div>
              <div className="h-6 rounded bg-indigo-400"></div>
              <div className="h-6 rounded bg-emerald-600"></div>
              <div className="h-6 rounded bg-indigo-600"></div>
              <div className="h-6 rounded bg-emerald-600"></div>
              <div className="h-6 rounded bg-indigo-600"></div>
            </div>
            <div className="text-[10px] text-center text-zinc-500 font-medium">{t.widget1Desc}</div>
          </div>

          {/* Floating Widget 2: Top Voted Place */}
          <div className="absolute -bottom-6 -right-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 z-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.widget2Title}</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-white">Senopati Social House</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <Check size={12} /> {t.widget2Desc}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">{t.featTitle}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-16">{t.featDesc}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Heatmap */}
          <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
              <Calendar size={24} />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{t.feat1Title}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">{t.feat1Desc}</p>
            <div className="flex gap-2">
              <div className="w-16 h-12 rounded-xl bg-indigo-700"></div>
              <div className="w-16 h-12 rounded-xl bg-indigo-600"></div>
              <div className="w-16 h-12 rounded-xl bg-indigo-400"></div>
              <div className="w-16 h-12 rounded-xl bg-indigo-300"></div>
              <div className="w-16 h-12 rounded-xl bg-indigo-200"></div>
            </div>
          </div>

          {/* Link Sekali Klik */}
          <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-700">
            <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-2xl flex items-center justify-center mb-6">
              <Share2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{t.feat2Title}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">{t.feat2Desc}</p>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 flex items-center justify-between border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">ngumpul.com/event/coffee-jkt</span>
              <div className="text-zinc-400"><Share2 size={14} /></div>
            </div>
          </div>

          {/* Voting Lokasi */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{t.feat3Title}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t.feat3Desc}</p>
          </div>

          {/* Integrasi Kalender */}
          <div className="md:col-span-2 bg-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-3 relative z-10">{t.feat4Title}</h3>
            <p className="text-indigo-200 max-w-sm mb-8 relative z-10">{t.feat4Desc}</p>
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => window.open('https://calendar.google.com/calendar/r/eventedit', '_blank')}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-indigo-500 flex items-center gap-2"
              >
                🗓️ Google Calendar
              </button>
              <button
                onClick={() => window.open('https://www.icloud.com/calendar/', '_blank')}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-indigo-500 flex items-center gap-2"
              >
                🍎 Apple Calendar
              </button>
            </div>
            {/* Decorative background circles */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -top-20 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-12 flex flex-wrap justify-between items-center gap-8 text-center border border-indigo-100/50 dark:border-indigo-900/20">
          <div>
            <div className="text-4xl font-black text-indigo-700 dark:text-indigo-400 mb-1">50k+</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.stat1}</div>
          </div>
          <div>
            <div className="text-4xl font-black text-indigo-700 dark:text-indigo-400 mb-1">200k+</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.stat2}</div>
          </div>
          <div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">98%</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.stat3}</div>
          </div>
          <div>
            <div className="text-4xl font-black text-indigo-700 dark:text-indigo-400 mb-1">15min</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.stat4}</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-8 tracking-tight">
          {t.ctaTitle1}<br/>{t.ctaTitle2}<span className="text-emerald-600 dark:text-emerald-500">{t.ctaTitle3}</span>
        </h2>
        <button
          onClick={onCreate}
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
        >
          {t.ctaBtn}
        </button>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} language={language} />
    </div>
  );
};

export const CreateEvent = ({ onSaved, language, initialEvent }: { onSaved: (event: NgumpulEvent) => void, language: 'en' | 'id', initialEvent?: NgumpulEvent }) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [desc, setDesc] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [locationDetails, setLocationDetails] = useState<{name: string, address: string, lat: number, lng: number} | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [startDate, setStartDate] = useState(initialEvent && initialEvent.dates.length > 0 ? format(parseISO(initialEvent.dates[0]), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialEvent && initialEvent.dates.length > 0 ? format(parseISO(initialEvent.dates[initialEvent.dates.length - 1]), 'yyyy-MM-dd') : format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(initialEvent?.startTime || "09:00");
  const [endTime, setEndTime] = useState(initialEvent?.endTime || "21:00");

  const mockPlaces = [
    { name: 'The Fluid Collective Lab', address: 'Jl. Senopati No. 8, Jakarta Selatan', lat: -6.2305, lng: 106.8080 },
    { name: 'Kopi Kenangan Senayan City', address: 'Senayan City Mall, Lt. LG, Jakarta', lat: -6.2270, lng: 106.7975 },
    { name: 'Union Brasserie', address: 'Plaza Senayan, Lt. G, Jakarta Pusat', lat: -6.2255, lng: 106.7995 },
    { name: 'Social House', address: 'Grand Indonesia, East Mall, Lt. 1, Jakarta', lat: -6.1950, lng: 106.8230 },
  ];

  const t = {
    newEventDetails: language === 'id' ? (initialEvent ? 'Edit Event' : 'Detail Event Baru') : (initialEvent ? 'Edit Event' : 'New Event Details'),
    eventName: language === 'id' ? 'Nama Event' : 'Event Name',
    eventNamePlaceholder: language === 'id' ? 'Contoh: Buka Puasa Bersama' : 'e.g., Team Dinner',
    descLabel: language === 'id' ? 'Deskripsi (Opsional)' : 'Description (Optional)',
    descPlaceholder: language === 'id' ? 'Detail acara, dresscode, dll...' : 'Event details, dress code, etc...',
    locationLabel: language === 'id' ? 'Lokasi (Opsional)' : 'Location (Optional)',
    locationPlaceholder: language === 'id' ? 'Cari tempat atau ketik manual' : 'Search place or type manually',
    startDateLabel: language === 'id' ? 'Mulai Tanggal' : 'Start Date',
    endDateLabel: language === 'id' ? 'Sampai Tanggal' : 'End Date',
    timeRangeLabel: language === 'id' ? 'Rentang Jam (Default 09:00 - 21:00)' : 'Time Range (Default 09:00 - 21:00)',
    createBtn: language === 'id' ? (initialEvent ? 'Simpan Perubahan' : 'Buat Event & Dapatkan Link') : (initialEvent ? 'Save Changes' : 'Create Event & Get Link'),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dates = eachDayOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate)
    }).map(d => d.toISOString());

    const newEvent: NgumpulEvent = {
      id: initialEvent?.id || Math.random().toString(36).substr(2, 9),
      title,
      description: desc,
      location: locationDetails ? locationDetails.name : location,
      dates,
      startTime,
      endTime,
      participants: initialEvent?.participants || []
    };
    onSaved(newEvent);
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xl shadow-zinc-100 dark:shadow-none"
      >
        <h2 className="text-3xl font-bold mb-8 dark:text-white">{t.newEventDetails}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.eventName}</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t.eventNamePlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.descLabel}</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder={t.descPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.locationLabel}</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-zinc-400 dark:text-zinc-500" size={18} />
              <input
                value={location}
                onChange={e => {
                  setLocation(e.target.value);
                  setShowAutocomplete(e.target.value.length > 2);
                }}
                onFocus={() => location.length > 2 && setShowAutocomplete(true)}
                placeholder={t.locationPlaceholder}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {showAutocomplete && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {mockPlaces.filter(p => p.name.toLowerCase().includes(location.toLowerCase())).map((place, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setLocation(place.name);
                        setLocationDetails(place);
                        setShowAutocomplete(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-start gap-3 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
                    >
                      <MapPin size={16} className="mt-1 text-zinc-400" />
                      <div>
                        <div className="font-bold text-sm text-zinc-900 dark:text-white">{place.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{place.address}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {locationDetails && (
              <div className="mt-4 h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 relative">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs font-bold uppercase tracking-widest bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')] bg-cover">
                  <div className="bg-white/80 dark:bg-zinc-900/80 px-3 py-1 rounded-full backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">Preview Map</div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600">
                  <MapPin size={24} fill="currentColor" />
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.startDateLabel}</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.endDateLabel}</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.timeRangeLabel}</label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
              <span className="text-zinc-400">to</span>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all mt-4"
          >
            {t.createBtn}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export const EventPage = ({ event, currentUser, language, onUpdateEvent }: { event: NgumpulEvent, currentUser: UserProfile | null, language: 'en' | 'id', onUpdateEvent: (e: NgumpulEvent) => void }) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [isJoined, setIsJoined] = useState(false); // Check if current user is already in participants
  
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setIsJoined(true);
    } else if (event.participants.some(p => p.id === currentUser?.id)) {
      setIsJoined(true);
    }
  }, [currentUser, event.participants]);

  const [myAvailability, setMyAvailability] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'input' | 'heatmap'>('input');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const t = {
    whoAreYou: language === 'id' ? 'Siapa namamu?' : 'What is your name?',
    enterName: language === 'id' ? 'Masukkan namamu untuk bergabung ke event' : 'Enter your name to join the event',
    namePlaceholder: language === 'id' ? 'Nama kamu' : 'Your name',
    continueBtn: language === 'id' ? 'Lanjut Isi Jadwal' : 'Continue to Schedule',
    peopleFilled: language === 'id' ? 'Orang sudah mengisi' : 'People have filled',
    bestSlots: language === 'id' ? '3 Slot Terbaik' : 'Top 3 Slots',
    peopleCan: language === 'id' ? 'Orang Bisa' : 'People Available',
    shareLink: language === 'id' ? 'Bagikan Link' : 'Share Link',
    inviteFriends: language === 'id' ? 'Ajak teman-temanmu buat isi jadwal juga!' : 'Invite your friends to fill the schedule too!',
    copied: language === 'id' ? 'Disalin!' : 'Copied!',
    copy: language === 'id' ? 'Salin' : 'Copy',
    mySchedule: language === 'id' ? 'Jadwal Saya' : 'My Schedule',
    groupHeatmap: language === 'id' ? 'Heatmap Grup' : 'Group Heatmap',
    reset: language === 'id' ? 'Reset' : 'Reset',
    saveSchedule: language === 'id' ? 'Simpan Jadwal' : 'Save Schedule',
    savedSuccess: language === 'id' ? 'Jadwal berhasil disimpan!' : 'Schedule saved successfully!',
    confirmSlot: language === 'id' ? 'Konfirmasi Waktu Ini' : 'Confirm This Time',
    confirmed: language === 'id' ? 'Waktu Terkonfirmasi!' : 'Time Confirmed!',
    confirmedSlotLabel: language === 'id' ? 'Waktu Final' : 'Final Time',
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/e/${event.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Generate time slots
  const times = React.useMemo(() => {
    const t = [];
    for (let i = 9; i <= 21; i++) {
      t.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return t;
  }, []);

  // Real heatmap data based on all participants
  const heatmapData = React.useMemo(() => {
    const data: Record<string, number> = {};
    
    // Initialize with 0
    event.dates.forEach(date => {
      times.forEach(time => {
        data[`${date}-${time}`] = 0;
      });
    });

    // Check if current user is already saved in event.participants
    const currentUserId = currentUser?.id;
    const alreadySaved = currentUserId
      ? event.participants.some(p => p.id === currentUserId)
      : false;

    // Add saved participants — but skip current user if we'll add their live slots below
    event.participants.forEach(p => {
      if (alreadySaved && p.id === currentUserId) return; // avoid double-count
      p.availability.forEach(slotId => {
        if (data[slotId] !== undefined) {
          data[slotId]++;
        }
      });
    });

    // Add current user's live (unsaved) availability so the preview is real-time
    if (isJoined && myAvailability.length > 0) {
      myAvailability.forEach(slotId => {
        if (data[slotId] !== undefined) {
          data[slotId]++;
        }
      });
    }
    
    return data;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.dates, times, event.participants, isJoined, myAvailability, currentUser?.id]);

  const getHeatmapColor = (count: number, total: number) => {
    if (count === 0) return 'bg-zinc-50 dark:bg-zinc-800/50';
    const ratio = count / Math.max(total, 1);
    if (ratio <= 0.25) return 'bg-violet-100 dark:bg-violet-900/40';
    if (ratio <= 0.5) return 'bg-violet-300 dark:bg-violet-700/60';
    if (ratio <= 0.75) return 'bg-violet-500 dark:bg-violet-500/80';
    return 'bg-violet-700 dark:bg-violet-400';
  };

  // Find best slots
  const bestSlots = React.useMemo(() => 
    Object.entries(heatmapData)
      .filter(([_, count]) => (count as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3),
    [heatmapData]
  );

  const toggleSlot = (date: string, time: string) => {
    const slotId = `${date}-${time}`;
    setMyAvailability(prev =>
      prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
    );
  };

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'add' | 'remove' | null>(null);

  const onMouseDown = (date: string, time: string) => {
    if (viewMode !== 'input') return;
    const slotId = `${date}-${time}`;
    const willAdd = !myAvailability.includes(slotId);
    setDragAction(willAdd ? 'add' : 'remove');
    setIsDragging(true);
    toggleSlot(date, time);
  };

  const onMouseEnterSlot = (date: string, time: string) => {
    const slotId = `${date}-${time}`;
    if (isDragging && dragAction) {
      if (dragAction === 'add' && !myAvailability.includes(slotId)) {
        setMyAvailability(prev => [...prev, slotId]);
      } else if (dragAction === 'remove' && myAvailability.includes(slotId)) {
        setMyAvailability(prev => prev.filter(id => id !== slotId));
      }
    }
    if (viewMode === 'heatmap') {
      setHoveredSlot(slotId);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    setDragAction(null);
  };

  React.useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

    const handleSaveSchedule = () => {
    const newParticipant: Participant = {
      id: currentUser?.id || Math.random().toString(36).substr(2, 9),
      name: name,
      availability: myAvailability,
      photoUrl: currentUser?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    const updatedParticipants = [...event.participants];
    const existingIdx = updatedParticipants.findIndex(p => p.id === newParticipant.id || (p.name === name && !p.id.includes('-')));
    
    if (existingIdx >= 0) {
      updatedParticipants[existingIdx] = newParticipant;
    } else {
      updatedParticipants.push(newParticipant);
    }

    onUpdateEvent({ ...event, participants: updatedParticipants });
    setIsJoined(true);
    setToastMsg(t.savedSuccess);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleConfirmSlot = (slotId: string) => {
    onUpdateEvent({ ...event, confirmedSlot: slotId });
    setToastMsg(t.confirmed);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isJoined) {
    return (
      <section className="pt-32 pb-20 px-4 sm:px-6 max-w-md mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xl dark:shadow-none text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
            <Users size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">{t.whoAreYou}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">{t.enterName} <span className="font-semibold text-zinc-900 dark:text-white">"{event.title}"</span></p>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-4 text-center text-lg"
          />
          <button
            onClick={() => name && setIsJoined(true)}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            {t.continueBtn}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Event Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">{event.title}</h1>
            {event.description && <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">{event.description}</p>}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-sm">
                <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>{format(parseISO(event.dates[0]), 'dd MMM')} - {format(parseISO(event.dates[event.dates.length - 1]), 'dd MMM yyyy')}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-sm">
                <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>{event.participants.length} {t.peopleFilled}</span>
              </div>
            </div>
            
            {event.confirmedSlot && (() => {
              const [datePart, timePart] = event.confirmedSlot!.split(/-(?=\d{2}:\d{2}$)/);
              const startDate = parseISO(datePart);
              const [startH, startM] = (timePart || '10:00').split(':').map(Number);
              const start = new Date(startDate);
              start.setHours(startH, startM);
              const end = new Date(start);
              end.setHours(start.getHours() + 2);
              const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
              const gcalParams = new URLSearchParams({
                action: 'TEMPLATE',
                text: event.title,
                dates: `${fmt(start)}/${fmt(end)}`,
                details: event.description || '',
                location: event.location || '',
              });
              
              const handleDownloadICS = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const icsContent = [
                  'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
                  `SUMMARY:${event.title}`,
                  `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
                  `DESCRIPTION:${event.description || ''}`,
                  `LOCATION:${event.location || ''}`,
                  'END:VEVENT', 'END:VCALENDAR'
                ].join('\n');
                const icsBlob = new Blob([icsContent], { type: 'text/calendar' });
                const icsUrl = URL.createObjectURL(icsBlob);
                const a = document.createElement('a');
                a.href = icsUrl;
                a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(icsUrl);
              };

              return (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-1">
                    <CheckCircle size={16} />
                    {t.confirmedSlotLabel}
                  </div>
                  <div className="text-zinc-900 dark:text-white font-black mb-3">
                    {format(parseISO(datePart), 'EEEE, dd MMM')} @ {timePart}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://calendar.google.com/calendar/render?${gcalParams.toString()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <span>🗓️</span> {language === 'id' ? 'Tambah ke Google Calendar' : 'Add to Google Calendar'}
                    </a>
                    <button
                      onClick={handleDownloadICS}
                      className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <span>🍎</span> {language === 'id' ? 'Tambah ke Apple Calendar' : 'Add to Apple Calendar'}
                    </button>
                  </div>
                </div>
              );
            })()}

            
            {event.location && (
              <div className="mt-6 h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 relative group cursor-pointer" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location!)}`, '_blank')}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800')] bg-cover group-hover:scale-105 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-zinc-900/90 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-md flex items-center justify-center">
                    <MapPin size={12} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{language === 'id' ? 'Buka Peta' : 'Open Maps'}</span>
                </div>
              </div>
            )}
          </div>

          {viewMode === 'heatmap' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Check size={18} />
                {t.bestSlots}
              </h3>
              <div className="space-y-3">
                {bestSlots.map(([slotId, count], i) => {
                  const [date, time] = slotId.split('-');
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20">
                      <div>
                        <div className="text-xs font-bold text-violet-900">{format(parseISO(date), 'EEEE, dd MMM')}</div>
                        <div className="text-sm font-medium text-violet-700">{time}</div>
                      </div>
                      <div className="text-xs font-bold bg-violet-600 text-white px-2 py-1 rounded-lg">
                        {count} {language === 'id' ? 'Orang' : 'People'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-indigo-600 dark:bg-indigo-500 rounded-3xl p-6 text-white">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Share2 size={18} />
              {t.shareLink}
            </h3>
            <p className="text-indigo-100 dark:text-indigo-50 text-xs mb-4">{t.inviteFriends}</p>
            <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs truncate opacity-80">{window.location.origin}/e/{event.id}</span>
              <button 
                onClick={handleCopyLink}
                className="bg-white text-indigo-600 dark:text-indigo-500 px-3 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-indigo-50"
              >
                {isCopied ? t.copied : t.copy}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('input')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                viewMode === 'input' ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              {t.mySchedule}
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                viewMode === 'heatmap' ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              {t.groupHeatmap}
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-4 sm:p-6 shadow-sm overflow-x-auto">
            <div className="min-w-max">
              {/* Header Row */}
              <div 
                className="grid gap-2 mb-4"
                style={{ gridTemplateColumns: `minmax(50px, auto) repeat(${event.dates.length}, minmax(60px, 1fr))` }}
              >
                <div className="col-span-1"></div>
                {event.dates.map((date, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">{format(parseISO(date), 'EEE')}</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">{format(parseISO(date), 'dd')}</div>
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="space-y-2">
                {times.map((time, i) => (
                  <div 
                    key={i} 
                    className="grid gap-2 items-center"
                    style={{ gridTemplateColumns: `minmax(50px, auto) repeat(${event.dates.length}, minmax(60px, 1fr))` }}
                  >
                    <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 text-right pr-2">{time}</div>
                    {event.dates.map((date, j) => {
                      const slotId = `${date}-${time}`;
                      const isSelected = myAvailability.includes(slotId);
                      const heatmapCount = heatmapData[slotId] || 0;
                      const isTopSlot = bestSlots.some(([id]) => id === slotId);

                      return (
                        <div
                          key={j}
                          onMouseDown={() => onMouseDown(date, time)}
                          onMouseEnter={() => onMouseEnterSlot(date, time)}
                          onMouseLeave={() => setHoveredSlot(null)}
                          className={cn(
                            "h-10 rounded-lg cursor-pointer transition-all border relative",
                            viewMode === 'input'
                              ? isSelected
                                ? "bg-indigo-600 border-indigo-700 shadow-inner"
                                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                              : cn(getHeatmapColor(heatmapCount, event.participants.length), "border-transparent", event.confirmedSlot === slotId && "ring-4 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900")
                          )}
                        >
                          {viewMode === 'input' && isSelected && (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              <Check size={14} />
                            </div>
                          )}

                          {viewMode === 'heatmap' && event.confirmedSlot === slotId && (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              <CheckCircle size={18} fill="currentColor" className="text-emerald-500" />
                            </div>
                          )}

                          {viewMode === 'heatmap' && isTopSlot && !event.confirmedSlot && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white dark:border-zinc-900 z-10 flex items-center justify-center">
                              <span className="text-[8px] font-black text-amber-900">!</span>
                            </div>
                          )}
                          
                          {viewMode === 'heatmap' && hoveredSlot === slotId && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] rounded-xl shadow-2xl z-50 pointer-events-none min-w-[120px]">
                              <div className="font-bold mb-1">{heatmapCount} {t.peopleCan}</div>
                              <div className="flex -space-x-1 border-t border-white/20 dark:border-zinc-200 pt-1">
                                {event.participants.filter(p => p.availability.includes(slotId)).slice(0, 5).map((p, i) => (
                                  <img key={i} src={p.photoUrl} className="w-4 h-4 rounded-full border border-zinc-900 dark:border-white" alt={p.name} />
                                ))}
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900 dark:border-t-white" />
                            </div>
                          )}

                          {viewMode === 'heatmap' && !event.confirmedSlot && hoveredSlot === slotId && heatmapCount > 0 && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleConfirmSlot(slotId); }}
                              className="absolute top-full left-1/2 -translate-x-1/2 mt-8 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl whitespace-nowrap z-50 hover:bg-emerald-700 transition-colors"
                            >
                              {t.confirmSlot}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
              {t.reset}
            </button>
            <button onClick={handleSaveSchedule} className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
              {t.saveSchedule}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle className="text-emerald-400 dark:text-emerald-500" size={24} />
            <span className="font-bold text-sm">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export const Dashboard = ({ 
  myEvents, 
  joinedEvents, 
  onSelectEvent, 
  onCreateNew,
  onDeleteEvent,
  onEditEvent,
  language
}: { 
  myEvents: NgumpulEvent[], 
  joinedEvents: NgumpulEvent[], 
  onSelectEvent: (e: NgumpulEvent) => void,
  onCreateNew: () => void,
  onDeleteEvent: (id: string) => void,
  onEditEvent: (e: NgumpulEvent) => void,
  language: 'en' | 'id'
}) => {
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const allEvents = [
    ...myEvents.map(e => ({ ...e, role: 'host' as const })),
    ...joinedEvents.map(e => ({ ...e, role: 'guest' as const }))
  ];

  const confirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete);
      setEventToDelete(null);
    }
  };

  const t = {
    title: language === 'id' ? 'Dashboard Jadwal' : 'Schedule Dashboard',
    desc: language === 'id' ? 'Kelola semua rencana kumpulmu di satu tempat.' : 'Manage all your gathering plans in one place.',
    newBtn: language === 'id' ? 'Event Baru' : 'New Event',
    emptyTitle: language === 'id' ? 'Belum ada jadwal' : 'No schedules yet',
    emptyDesc: language === 'id' ? 'Mulai dengan membuat event baru atau minta link dari teman.' : 'Start by creating a new event or ask for a link from a friend.',
    hostBadge: language === 'id' ? 'Dibuat Saya' : 'Created by Me',
    guestBadge: language === 'id' ? 'Dari Teman' : 'From Friend',
    dateLabel: language === 'id' ? 'Opsi Tanggal' : 'Date Options',
    participantLabel: language === 'id' ? 'Peserta' : 'Participants',
    deleteConfirmTitle: language === 'id' ? 'Hapus Event?' : 'Delete Event?',
    deleteConfirmDesc: language === 'id' ? 'Tindakan ini tidak dapat dibatalkan. Semua data terkait event ini akan hilang.' : 'This action cannot be undone. All data related to this event will be lost.',
    cancelBtn: language === 'id' ? 'Batal' : 'Cancel',
    deleteBtn: language === 'id' ? 'Hapus Permanen' : 'Delete Permanently',
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{t.title}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">{t.desc}</p>
        </div>
        <button
          onClick={onCreateNew}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus size={18} />
          {t.newBtn}
        </button>
      </div>

      {allEvents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <Calendar className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-zinc-400 dark:text-zinc-500">{t.emptyTitle}</h3>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">{t.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allEvents.map((event) => {
            const isPast = new Date(event.dates[event.dates.length - 1]) < new Date(new Date().setHours(0,0,0,0));
            
            return (
              <motion.div
                key={event.id}
                whileHover={{ y: -4 }}
                onClick={() => onSelectEvent(event)}
                className={cn(
                  "bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer group",
                  isPast && "opacity-60 grayscale hover:grayscale-0"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    event.role === 'host' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  )}>
                    {event.role === 'host' ? t.hostBadge : t.guestBadge}
                  </div>
                  <div className="flex items-center gap-2">
                    {event.role === 'host' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditEvent(event); }} 
                        className="text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-1.5 rounded-lg transition-colors"
                        title={language === 'id' ? 'Edit Event' : 'Edit Event'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEventToDelete(event.id); }} 
                      className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                      title={language === 'id' ? 'Hapus Event' : 'Delete Event'}
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
                    <Calendar size={14} />
                    <span>{format(parseISO(event.dates[0]), 'dd MMM')} - {format(parseISO(event.dates[event.dates.length - 1]), 'dd MMM yyyy')}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
                      <MapPin size={14} />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs mt-2">
                    <Users size={14} className="shrink-0" />
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-2">
                        {event.participants.slice(0, 4).map((p, i) => (
                          <img key={i} src={p.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt={p.name} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 object-cover" />
                        ))}
                      </div>
                      {event.participants.length > 4 ? (
                        <span className="text-xs font-medium">+{event.participants.length - 4}</span>
                      ) : event.participants.length === 0 ? (
                        <span className="text-xs">{language === 'id' ? 'Belum ada yang isi' : 'No one has filled yet'}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {eventToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEventToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-zinc-100 dark:border-zinc-800"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t.deleteConfirmTitle}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                {t.deleteConfirmDesc}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setEventToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  {t.deleteBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

// --- Auth & Profile ---

const Login = ({ onLogin, language }: { onLogin: (user: UserProfile) => void, language: 'en' | 'id' }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');

  const t = {
    login: language === 'id' ? 'Login' : 'Login',
    signup: language === 'id' ? 'Sign Up' : 'Sign Up',
    emailLabel: language === 'id' ? 'Email' : 'Email',
    authCodeLabel: language === 'id' ? 'Kode Autentikasi' : 'Authentication Code',
    sendCode: language === 'id' ? 'Kirim Kode' : 'Send Code',
    passwordLabel: language === 'id' ? 'Password' : 'Password',
    loginBtn: language === 'id' ? 'Masuk' : 'Log In',
    signupBtn: language === 'id' ? 'Daftar Sekarang' : 'Sign Up Now',
    or: language === 'id' ? 'Atau' : 'Or',
    googleLogin: language === 'id' ? 'Login lewat Google' : 'Log in with Google',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0] || 'User',
      email,
      bio: 'Halo! Saya menggunakan Ngumpul.',
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    });
  };

  const handleGoogleLogin = () => {
    onLogin({
      id: 'google-user',
      name: 'Haikal',
      email: 'haikal@gmail.com',
      bio: 'Suka nongkrong dan ngopi.',
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=haikal`
    });
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xl"
      >
        <div className="flex gap-4 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <button 
            onClick={() => setIsSignUp(false)}
            className={cn("text-lg font-bold transition-colors", !isSignUp ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500")}
          >
            {t.login}
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={cn("text-lg font-bold transition-colors", isSignUp ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500")}
          >
            {t.signup}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-zinc-400 dark:text-zinc-500" size={18} />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          </div>
          
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.authCodeLabel}</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-4 top-3.5 text-zinc-400 dark:text-zinc-500" size={18} />
                  <input required type="text" value={authCode} onChange={e => setAuthCode(e.target.value)} placeholder="123456" className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <button type="button" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-4 rounded-xl text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap">{t.sendCode}</button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.passwordLabel}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-zinc-400 dark:text-zinc-500" size={18} />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all mt-6">
            {isSignUp ? t.signupBtn : t.loginBtn}
          </button>
        </form>

        <div className="mt-6 relative flex items-center justify-center">
          <div className="absolute border-t border-zinc-200 dark:border-zinc-800 w-full"></div>
          <span className="bg-white dark:bg-zinc-900 px-4 text-xs text-zinc-400 dark:text-zinc-500 relative z-10 uppercase font-bold tracking-wider">{t.or}</span>
        </div>

        <button onClick={handleGoogleLogin} type="button" className="w-full mt-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-4 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t.googleLogin}
        </button>
      </motion.div>
    </section>
  );
};

const Profile = ({ user, onSave, onLogout, language }: { user: UserProfile, onSave: (u: UserProfile) => void, onLogout: () => void, language: 'en' | 'id' }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);

  const t = {
    myProfile: language === 'id' ? 'Profil Saya' : 'My Profile',
    fullName: language === 'id' ? 'Nama Lengkap' : 'Full Name',
    bioLabel: language === 'id' ? 'Bio' : 'Bio',
    saveProfile: language === 'id' ? 'Simpan Profil' : 'Save Profile',
    photoUrlPlaceholder: language === 'id' ? 'URL Foto Profil' : 'Profile Photo URL',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, name, bio, photoUrl });
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold dark:text-white">{t.myProfile}</h2>
          <button onClick={onLogout} type="button" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Logout">
            <LogOut size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img src={photoUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-zinc-50 dark:border-zinc-800 object-cover shadow-sm" />
              <button type="button" className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <input 
              type="text" 
              value={photoUrl} 
              onChange={e => setPhotoUrl(e.target.value)} 
              placeholder={t.photoUrlPlaceholder}
              className="w-full px-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.fullName}</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.bioLabel}</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24" />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all">
            {t.saveProfile}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

const GenericPage = ({ title, subtitle, children, onNavigate, language }: { title: string, subtitle?: string, children: React.ReactNode, onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <div className="w-full bg-white dark:bg-zinc-950 font-sans pt-32 min-h-screen flex flex-col">
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 w-full mb-20">
      <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6">{title}</h1>
      {subtitle && <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-12">{subtitle}</p>}
      <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </div>
    <Footer onNavigate={onNavigate} language={language} />
  </div>
);

const FeaturesPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Fitur' : 'Features'} 
    subtitle={language === 'id' ? 'Semua yang Anda butuhkan untuk mengatur kumpul-kumpul yang sempurna.' : 'Everything you need to organize the perfect gathering.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{language === 'id' ? 'Heatmap Pintar' : 'Smart Heatmap'}</h3>
        <p>{language === 'id' ? 'Lihat secara visual kapan semua orang luang. Algoritma kami menyoroti slot waktu terbaik secara otomatis.' : 'Visually see when everyone is free. Our algorithm highlights the best time slots automatically.'}</p>
      </div>
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{language === 'id' ? 'Link Sekali Klik' : 'One-Click Links'}</h3>
        <p>{language === 'id' ? 'Bagikan link unik ke WhatsApp, Telegram, atau Slack. Teman Anda tidak perlu menginstal aplikasi.' : 'Share a unique link to WhatsApp, Telegram, or Slack. No app installation required for your friends.'}</p>
      </div>
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{language === 'id' ? 'Voting Lokasi' : 'Location Voting'}</h3>
        <p>{language === 'id' ? 'Berikan beberapa opsi tempat dan biarkan demokrasi bekerja. Tidak ada lagi perdebatan panjang tentang tujuan.' : 'Give a few place options and let democracy work. No more long debates about where to go.'}</p>
      </div>
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{language === 'id' ? 'Integrasi Kalender' : 'Calendar Integration'}</h3>
        <p>{language === 'id' ? 'Tambahkan acara yang sudah final secara otomatis ke Google Calendar atau Apple Calendar untuk semua peserta.' : 'Automatically add finalized events to Google Calendar or Apple Calendar for all participants.'}</p>
      </div>
    </div>
  </GenericPage>
);

const IntegrationsPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Integrasi' : 'Integrations'} 
    subtitle={language === 'id' ? 'Hubungkan Ngumpul dengan alat favorit Anda.' : 'Connect Ngumpul with your favorite tools.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 text-center">
      {['Google Calendar', 'Apple Calendar', 'Outlook', 'Slack', 'WhatsApp', 'Zoom', 'Google Meet', 'Teams'].map(tool => (
        <div key={tool} className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl font-bold text-zinc-900 dark:text-white flex items-center justify-center h-32">
          {tool}
        </div>
      ))}
    </div>
  </GenericPage>
);

const EnterprisePage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Perusahaan' : 'Enterprise'} 
    subtitle={language === 'id' ? 'Tingkatkan penjadwalan tim Anda dengan keamanan dan kontrol lanjutan.' : 'Scale your team\'s scheduling with advanced security and controls.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <ul className="space-y-4 list-disc pl-6">
      <li><strong>Single Sign-On (SSO):</strong> {language === 'id' ? 'Integrasi dengan Okta, Google Workspace, atau Azure AD.' : 'Integrate with Okta, Google Workspace, or Azure AD.'}</li>
      <li><strong>{language === 'id' ? 'Branding Kustom' : 'Custom Branding'}:</strong> {language === 'id' ? 'Tambahkan logo dan warna perusahaan Anda ke halaman penjadwalan.' : 'Add your company logo and colors to scheduling pages.'}</li>
      <li><strong>{language === 'id' ? 'Analitik Lanjutan' : 'Advanced Analytics'}:</strong> {language === 'id' ? 'Lacak metrik pertemuan dan produktivitas tim.' : 'Track meeting metrics and team productivity.'}</li>
      <li><strong>{language === 'id' ? 'Dukungan Khusus' : 'Dedicated Support'}:</strong> {language === 'id' ? 'Dukungan prioritas 24/7 dan manajer akun khusus.' : '24/7 priority support and a dedicated account manager.'}</li>
    </ul>
  </GenericPage>
);

const PricingPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Harga' : 'Pricing'} 
    subtitle={language === 'id' ? 'Harga yang sederhana dan transparan untuk semua orang.' : 'Simple, transparent pricing for everyone.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{language === 'id' ? 'Gratis' : 'Free'}</h3>
        <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-6">$0<span className="text-lg text-zinc-500 font-normal">{language === 'id' ? '/bln' : '/mo'}</span></p>
        <ul className="space-y-3 mb-8">
          <li>✓ {language === 'id' ? 'Acara tak terbatas' : 'Unlimited events'}</li>
          <li>✓ {language === 'id' ? 'Hingga 20 peserta' : 'Up to 20 participants'}</li>
          <li>✓ {language === 'id' ? 'Heatmap dasar' : 'Basic heatmap'}</li>
        </ul>
        <button className="w-full py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white">{language === 'id' ? 'Mulai' : 'Get Started'}</button>
      </div>
      <div className="p-8 bg-indigo-600 rounded-3xl text-white shadow-xl transform md:-translate-y-4">
        <h3 className="text-2xl font-bold mb-2">Pro</h3>
        <p className="text-4xl font-black mb-6">$5<span className="text-lg text-indigo-200 font-normal">{language === 'id' ? '/bln' : '/mo'}</span></p>
        <ul className="space-y-3 mb-8 text-indigo-100">
          <li>✓ {language === 'id' ? 'Peserta tak terbatas' : 'Unlimited participants'}</li>
          <li>✓ {language === 'id' ? 'Integrasi kalender' : 'Calendar integrations'}</li>
          <li>✓ {language === 'id' ? 'Voting lokasi' : 'Location voting'}</li>
          <li>✓ {language === 'id' ? 'Hapus branding' : 'Remove branding'}</li>
        </ul>
        <button className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold">{language === 'id' ? 'Tingkatkan ke Pro' : 'Upgrade to Pro'}</button>
      </div>
      <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{language === 'id' ? 'Perusahaan' : 'Enterprise'}</h3>
        <p className="text-4xl font-black text-zinc-900 dark:text-white mb-6">{language === 'id' ? 'Kustom' : 'Custom'}</p>
        <ul className="space-y-3 mb-8">
          <li>✓ {language === 'id' ? 'SSO & Keamanan Lanjutan' : 'SSO & Advanced Security'}</li>
          <li>✓ {language === 'id' ? 'Branding Kustom' : 'Custom Branding'}</li>
          <li>✓ {language === 'id' ? 'Dukungan Khusus' : 'Dedicated Support'}</li>
        </ul>
        <button className="w-full py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white">{language === 'id' ? 'Hubungi Sales' : 'Contact Sales'}</button>
      </div>
    </div>
  </GenericPage>
);

const AboutPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Tentang Kami' : 'About Us'} 
    subtitle={language === 'id' ? 'Kami adalah The Fluid Collective.' : 'We are The Fluid Collective.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <p className="mb-4">{language === 'id' ? 'Ngumpul lahir dari rasa frustrasi yang sederhana: mengapa sangat sulit menemukan waktu yang cocok untuk semua orang?' : 'Ngumpul was born out of a simple frustration: why is it so hard to find a time that works for everyone?'}</p>
    <p className="mb-4">{language === 'id' ? 'Kami percaya bahwa teknologi harus menyatukan orang-orang, bukan menciptakan lebih banyak gesekan. Misi kami adalah menghilangkan perdebatan tanpa akhir di grup chat dan membuat penjadwalan semudah membagikan satu tautan.' : 'We believe that technology should bring people together, not create more friction. Our mission is to eliminate the endless back-and-forth in group chats and make scheduling as easy as sharing a single link.'}</p>
    <p>{language === 'id' ? 'Dibuat dengan cinta di Jakarta, Indonesia.' : 'Built with love in Jakarta, Indonesia.'}</p>
  </GenericPage>
);

const CareersPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Karir' : 'Careers'} 
    subtitle={language === 'id' ? 'Bergabunglah dengan kami untuk membuat kumpul-kumpul lebih mudah.' : 'Join us in making gatherings easier.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <div className="space-y-6 mt-8">
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Senior Frontend Engineer</h3>
          <p>{language === 'id' ? 'Remote • Penuh Waktu' : 'Remote • Full-time'}</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">{language === 'id' ? 'Lamar' : 'Apply'}</button>
      </div>
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Product Designer</h3>
          <p>{language === 'id' ? 'Jakarta • Penuh Waktu' : 'Jakarta • Full-time'}</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">{language === 'id' ? 'Lamar' : 'Apply'}</button>
      </div>
    </div>
  </GenericPage>
);

const JournalPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Jurnal' : 'Journal'} 
    subtitle={language === 'id' ? 'Pemikiran tentang produktivitas, desain, dan menyatukan orang-orang.' : 'Thoughts on productivity, design, and bringing people together.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <div className="space-y-8 mt-8">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{language === 'id' ? 'Pembaruan Produk' : 'Product Updates'}</span>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2 mb-3">{language === 'id' ? 'Memperkenalkan Sinkronisasi Kalender' : 'Introducing Calendar Sync'}</h3>
        <p className="mb-4">{language === 'id' ? 'Anda sekarang dapat secara otomatis menyinkronkan acara yang sudah final ke Google atau Apple Calendar Anda.' : 'You can now automatically sync finalized events to your Google or Apple Calendar.'}</p>
        <button className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{language === 'id' ? 'Baca selengkapnya →' : 'Read more →'}</button>
      </div>
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{language === 'id' ? 'Desain' : 'Design'}</span>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2 mb-3">{language === 'id' ? 'Filosofi di Balik Heatmap' : 'The Philosophy Behind the Heatmap'}</h3>
        <p className="mb-4">{language === 'id' ? 'Bagaimana kami merancang heatmap ketersediaan agar intuitif dan mudah diakses.' : 'How we designed the availability heatmap to be intuitive and accessible.'}</p>
        <button className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{language === 'id' ? 'Baca selengkapnya →' : 'Read more →'}</button>
      </div>
    </div>
  </GenericPage>
);

const ContactPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Kontak' : 'Contact'} 
    subtitle={language === 'id' ? 'Kami ingin mendengar dari Anda.' : 'We\'d love to hear from you.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <form className="max-w-xl space-y-6 mt-8" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">{language === 'id' ? 'Nama' : 'Name'}</label>
        <input type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder={language === 'id' ? 'Nama Anda' : 'Your name'} />
      </div>
      <div>
        <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Email</label>
        <input type="email" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">{language === 'id' ? 'Pesan' : 'Message'}</label>
        <textarea className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 h-32" placeholder={language === 'id' ? 'Bagaimana kami bisa membantu?' : 'How can we help?'}></textarea>
      </div>
      <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">{language === 'id' ? 'Kirim Pesan' : 'Send Message'}</button>
    </form>
  </GenericPage>
);

const PrivacyPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'} 
    subtitle={language === 'id' ? 'Terakhir diperbarui: Oktober 2024' : 'Last updated: October 2024'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">{language === 'id' ? '1. Informasi yang Kami Kumpulkan' : '1. Information We Collect'}</h3>
    <p className="mb-6">{language === 'id' ? 'Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, seperti saat Anda membuat akun, membuat acara, atau berkomunikasi dengan kami. Ini mungkin termasuk nama, alamat email, dan data ketersediaan kalender Anda.' : 'We collect information you provide directly to us, such as when you create an account, create an event, or communicate with us. This may include your name, email address, and calendar availability data.'}</p>
    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">{language === 'id' ? '2. Bagaimana Kami Menggunakan Informasi Anda' : '2. How We Use Your Information'}</h3>
    <p className="mb-6">{language === 'id' ? 'Kami menggunakan informasi yang kami kumpulkan untuk menyediakan, memelihara, dan meningkatkan layanan kami, untuk memproses transaksi, dan untuk berkomunikasi dengan Anda.' : 'We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.'}</p>
    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">{language === 'id' ? '3. Berbagi Informasi' : '3. Information Sharing'}</h3>
    <p className="mb-6">{language === 'id' ? 'Kami tidak membagikan informasi pribadi Anda dengan pihak ketiga kecuali seperti yang dijelaskan dalam kebijakan privasi ini atau dengan persetujuan Anda.' : 'We do not share your personal information with third parties except as described in this privacy policy or with your consent.'}</p>
  </GenericPage>
);

const TermsPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Syarat Ketentuan' : 'Terms of Service'} 
    subtitle={language === 'id' ? 'Terakhir diperbarui: Oktober 2024' : 'Last updated: October 2024'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">{language === 'id' ? '1. Penerimaan Syarat' : '1. Acceptance of Terms'}</h3>
    <p className="mb-6">{language === 'id' ? 'Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat oleh Syarat ini. Jika Anda tidak menyetujui Syarat ini, Anda tidak boleh mengakses atau menggunakan layanan.' : 'By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the services.'}</p>
    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">{language === 'id' ? '2. Perilaku Pengguna' : '2. User Conduct'}</h3>
    <p className="mb-6">{language === 'id' ? 'Anda setuju untuk tidak menggunakan layanan dengan cara apa pun yang melanggar hukum atau peraturan lokal, negara bagian, nasional, atau internasional yang berlaku.' : 'You agree not to use the services in any way that violates any applicable local, state, national, or international law or regulation.'}</p>
    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">{language === 'id' ? '3. Penghentian' : '3. Termination'}</h3>
    <p className="mb-6">{language === 'id' ? 'Kami dapat menghentikan atau menangguhkan akses Anda ke layanan kami segera, tanpa pemberitahuan sebelumnya atau kewajiban, untuk alasan apa pun, termasuk tanpa batasan jika Anda melanggar Syarat.' : 'We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.'}</p>
  </GenericPage>
);

const CalendarPage = ({ onNavigate, language }: { onNavigate: (v: string) => void, language: 'en' | 'id' }) => (
  <GenericPage 
    title={language === 'id' ? 'Kalender' : 'Calendar'} 
    subtitle={language === 'id' ? 'Kelola semua acara Anda di satu tempat.' : 'Manage all your events in one place.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 dark:text-white mb-4">{language === 'id' ? 'Bulan Ini' : 'This Month'}</h3>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="font-bold text-zinc-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className={cn("p-2 rounded-full", i === 14 ? "bg-indigo-600 text-white font-bold" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer")}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-500/20">
          <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">{language === 'id' ? 'Sinkronisasi Kalender' : 'Sync Calendar'}</h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">{language === 'id' ? 'Hubungkan dengan Google Calendar atau Outlook.' : 'Connect with Google Calendar or Outlook.'}</p>
          <button className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
            {language === 'id' ? 'Hubungkan' : 'Connect'}
          </button>
        </div>
      </div>
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{language === 'id' ? 'Jadwal Mendatang' : 'Upcoming Schedule'}</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"><ChevronLeft size={20} /></button>
            <button className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"><ChevronRight size={20} /></button>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 text-center min-w-[80px]">
              <div className="text-xs font-bold text-zinc-500 uppercase">{language === 'id' ? 'Okt' : 'Oct'}</div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{14 + i}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-1">{language === 'id' ? 'Rapat Tim Mingguan' : 'Weekly Team Sync'}</h4>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1"><Calendar size={14} /> 10:00 - 11:30</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> Google Meet</span>
              </div>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((j) => (
                <img key={j} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}${j}`} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </GenericPage>
);

const CreateTeam = ({ onCreated, onCancel, language }: { onCreated: (team: Team) => void, onCancel: () => void, language: 'en' | 'id' }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colors = [
      'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20',
      'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
    ];
    
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description: desc,
      members: [], // Just the creator initially
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date().toISOString(),
    };
    onCreated(newTeam);
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {language === 'id' ? 'Buat Tim Baru' : 'Create New Team'}
          </h2>
          <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <ChevronLeft size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              {language === 'id' ? 'Nama Tim' : 'Team Name'}
            </label>
            <input 
              required 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={language === 'id' ? 'Contoh: Tim Desain' : 'e.g., Design Team'}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              {language === 'id' ? 'Deskripsi (Opsional)' : 'Description (Optional)'}
            </label>
            <textarea 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder={language === 'id' ? 'Apa tujuan tim ini?' : 'What is the purpose of this team?'}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] text-zinc-900 dark:text-white"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Users size={20} />
            {language === 'id' ? 'Buat Tim' : 'Create Team'}
          </button>
        </form>
      </div>
    </section>
  );
};

const TeamWorkspace = ({ team, onBack, language }: { team: Team, onBack: () => void, language: 'en' | 'id' }) => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors font-medium"
      >
        <ChevronLeft size={20} />
        {language === 'id' ? 'Kembali ke Tim' : 'Back to Teams'}
      </button>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center border text-3xl", team.color)}>
              <Users size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{team.name}</h1>
              <p className="text-zinc-500 dark:text-zinc-400">{team.description || (language === 'id' ? 'Tidak ada deskripsi' : 'No description provided')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2">
              <Users size={16} />
              {language === 'id' ? 'Undang' : 'Invite'}
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={16} />
              {language === 'id' ? 'Event Baru' : 'New Event'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{language === 'id' ? 'Event Tim' : 'Team Events'}</h2>
          
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Calendar className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-zinc-400 dark:text-zinc-500">{language === 'id' ? 'Belum ada event' : 'No events yet'}</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">{language === 'id' ? 'Buat event pertama untuk tim ini.' : 'Create the first event for this team.'}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{language === 'id' ? 'Anggota' : 'Members'} ({team.members.length})</h2>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="space-y-4">
              {team.members.slice(0, 5).map((member, j) => (
                <div key={member.id} className="flex items-center gap-3">
                  <img src={member.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt="avatar" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white text-sm">{member.name}</div>
                    <div className="text-xs text-zinc-500">{member.role === 'admin' ? 'Admin' : 'Member'}</div>
                  </div>
                </div>
              ))}
              {team.members.length > 5 && (
                <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                    {language === 'id' ? `Lihat semua ${team.members.length} anggota` : `View all ${team.members.length} members`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TeamsPage = ({ 
  onNavigate, 
  language,
  teams,
  onCreateTeam,
  onSelectTeam
}: { 
  onNavigate: (v: string) => void, 
  language: 'en' | 'id',
  teams: Team[],
  onCreateTeam: () => void,
  onSelectTeam: (team: Team) => void
}) => (
  <GenericPage 
    title={language === 'id' ? 'Tim' : 'Teams'} 
    subtitle={language === 'id' ? 'Berkolaborasi dan jadwalkan pertemuan dengan tim Anda.' : 'Collaborate and schedule with your team.'} 
    onNavigate={onNavigate} 
    language={language}
  >
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{language === 'id' ? 'Ruang Kerja Anda' : 'Your Workspaces'}</h2>
      <button 
        onClick={onCreateTeam}
        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <Users size={16} />
        {language === 'id' ? 'Buat Tim Baru' : 'Create New Team'}
      </button>
    </div>
    
    {teams.length === 0 ? (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <Users className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" size={48} />
        <h3 className="text-lg font-bold text-zinc-400 dark:text-zinc-500">{language === 'id' ? 'Belum ada tim' : 'No teams yet'}</h3>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">{language === 'id' ? 'Mulai dengan membuat tim baru.' : 'Start by creating a new team.'}</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, i) => (
          <div 
            key={team.id} 
            onClick={() => onSelectTeam(team)}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", team.color)}>
                <Users size={24} />
              </div>
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><ChevronRight size={20} /></button>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{team.name}</h3>
            <p className="text-zinc-500 text-sm mb-6">{team.members.length} {language === 'id' ? 'Anggota' : 'Members'}</p>
            <div className="flex -space-x-2">
              {team.members.slice(0, 5).map((member, j) => (
                <img key={member.id} src={member.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100" />
              ))}
              {team.members.length > 5 && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                  +{team.members.length - 5}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </GenericPage>
);

// --- Main App ---

export default function App() {
  type ViewState = 'landing' | 'create' | 'edit' | 'event' | 'dashboard' | 'login' | 'profile' | 'features' | 'integrations' | 'enterprise' | 'pricing' | 'about' | 'careers' | 'journal' | 'contact' | 'privacy' | 'terms' | 'calendar' | 'teams' | 'create-team' | 'team-workspace';
  const [view, setView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentEvent, setCurrentEvent] = useState<NgumpulEvent | null>(null);
  const [myEvents, setMyEvents] = useState<NgumpulEvent[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<NgumpulEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [showLangPopup, setShowLangPopup] = useState(false);

  React.useEffect(() => {
    const lang = localStorage.getItem('ngumpul_lang');
    if (!lang) {
      setShowLangPopup(true);
    } else {
      setLanguage(lang as 'en' | 'id');
    }
  }, []);

  const handleSelectLanguage = (lang: 'en' | 'id') => {
    setLanguage(lang);
    localStorage.setItem('ngumpul_lang', lang);
    setShowLangPopup(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleCreateEvent = (event: NgumpulEvent) => {
    // Add mock participants for demo purposes
    const mockNames = ['Aria', 'Bimo', 'Citra', 'Davi', 'Elsa'];
    const mockParticipants: Participant[] = mockNames.map((name, i) => {
      const availability: string[] = [];
      // Randomly pick 10-20 slots
      for (let j = 0; j < 15; j++) {
        const date = event.dates[Math.floor(Math.random() * event.dates.length)];
        const time = `${(Math.floor(Math.random() * (21 - 9 + 1)) + 9).toString().padStart(2, '0')}:00`;
        availability.push(`${date}-${time}`);
      }
      return {
        id: `mock-${i}`,
        name,
        availability: Array.from(new Set(availability)),
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      };
    });

    const eventWithMocks = { ...event, participants: mockParticipants };
    setMyEvents(prev => [eventWithMocks, ...prev]);
    setCurrentEvent(eventWithMocks);
    setView('event');
  };

  const handleUpdateEvent = (updatedEvent: NgumpulEvent) => {
    setMyEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setCurrentEvent(updatedEvent);
    setView('event');
  };

  const handleDeleteEvent = (id: string) => {
    setMyEvents(prev => prev.filter(e => e.id !== id));
    setJoinedEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleCreateTeam = (team: Team) => {
    setTeams(prev => [team, ...prev]);
    setCurrentTeam(team);
    setView('team-workspace');
  };

  const handleSelectTeam = (team: Team) => {
    setCurrentTeam(team);
    setView('team-workspace');
  };

  // Mock: Simulate joining a friend's event for demo purposes
  React.useEffect(() => {
    if (joinedEvents.length === 0) {
      const mockFriendEvent: NgumpulEvent = {
        id: 'friend-123',
        title: 'Bukber Alumni SMA',
        description: 'Bukber seru-seruan aja, jangan lupa bawa kado silang!',
        location: 'Resto Pagi Sore, Jakarta',
        dates: [addDays(new Date(), -5).toISOString(), addDays(new Date(), -4).toISOString()], // Made past date to test fading
        startTime: '17:00',
        endTime: '21:00',
        participants: [
          { id: '1', name: 'Budi', availability: [], photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
          { id: '2', name: 'Siti', availability: [], photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
          { id: '3', name: 'Andi', availability: [], photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi' },
          { id: '4', name: 'Rina', availability: [], photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina' },
          { id: '5', name: 'Joko', availability: [], photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joko' },
          { id: '6', name: 'Dewi', availability: [], photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi' }
        ]
      };
      setJoinedEvents([mockFriendEvent]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
      <AnimatePresence>
        {showLangPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center"
            >
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Select Language</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">Pilih bahasa / Choose your language</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleSelectLanguage('id')}
                  className="w-full py-4 px-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🇮🇩</span> Bahasa Indonesia
                </button>
                <button 
                  onClick={() => handleSelectLanguage('en')}
                  className="w-full py-4 px-6 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🇬🇧</span> English
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar 
        view={view}
        onNavigate={(v) => setView(v as ViewState)}
        hasEvents={myEvents.length > 0 || joinedEvents.length > 0}
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        onCreate={() => setView('create')}
        language={language}
        setLanguage={setLanguage}
      />

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onCreate={() => setView('create')} onNavigate={(v) => setView(v as ViewState)} language={language} />
          </motion.div>
        )}

        {view === 'features' && <motion.div key="features" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><FeaturesPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'integrations' && <motion.div key="integrations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><IntegrationsPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'enterprise' && <motion.div key="enterprise" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EnterprisePage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'pricing' && <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PricingPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'about' && <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AboutPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'careers' && <motion.div key="careers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CareersPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'journal' && <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><JournalPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'contact' && <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ContactPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'privacy' && <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PrivacyPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'terms' && <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TermsPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'calendar' && <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CalendarPage onNavigate={(v) => setView(v as ViewState)} language={language} /></motion.div>}
        {view === 'teams' && <motion.div key="teams" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TeamsPage onNavigate={(v) => setView(v as ViewState)} language={language} teams={teams} onCreateTeam={() => setView('create-team')} onSelectTeam={handleSelectTeam} /></motion.div>}
        {view === 'create-team' && <motion.div key="create-team" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><CreateTeam onCreated={handleCreateTeam} onCancel={() => setView('teams')} language={language} /></motion.div>}
        {view === 'team-workspace' && currentTeam && <motion.div key="team-workspace" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><TeamWorkspace team={currentTeam} onBack={() => setView('teams')} language={language} /></motion.div>}

        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CreateEvent onSaved={handleCreateEvent} language={language} />
          </motion.div>
        )}

        {view === 'edit' && currentEvent && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CreateEvent onSaved={handleUpdateEvent} language={language} initialEvent={currentEvent} />
          </motion.div>
        )}

        {view === 'event' && currentEvent && (
          <motion.div
            key="event"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EventPage 
              event={currentEvent} 
              currentUser={currentUser} 
              language={language} 
              onUpdateEvent={(e) => {
                if (myEvents.some(me => me.id === e.id)) {
                  handleUpdateEvent(e);
                } else {
                  setJoinedEvents(prev => prev.map(je => je.id === e.id ? e : je));
                  setCurrentEvent(e);
                }
              }} 
            />
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Login onLogin={(user) => {
              setCurrentUser(user);
              setView('dashboard');
            }} language={language} />
          </motion.div>
        )}

        {view === 'profile' && currentUser && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Profile 
              user={currentUser} 
              onSave={(user) => {
                setCurrentUser(user);
                setView('dashboard');
              }}
              onLogout={() => {
                setCurrentUser(null);
                setView('landing');
              }}
              language={language}
            />
          </motion.div>
        )}

        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Dashboard 
              myEvents={myEvents} 
              joinedEvents={joinedEvents} 
              onSelectEvent={(e) => {
                setCurrentEvent(e);
                setView('event');
              }}
              onCreateNew={() => setView('create')}
              onDeleteEvent={handleDeleteEvent}
              onEditEvent={(e) => {
                setCurrentEvent(e);
                setView('edit');
              }}
              language={language}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-10 px-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-zinc-400 dark:text-zinc-500 text-sm">
        <p>&copy; 2026 Ngumpul. Dibuat dengan ❤️ untuk komunitas Indonesia.</p>
      </footer>
    </div>
  );
}

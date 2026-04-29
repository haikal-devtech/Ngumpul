"use client";

import React from 'react';
import Image from 'next/image';
import { MapPin, ChevronRight, Plus, Users, CheckCircle, Calendar, Share2, Check } from 'lucide-react';
import { motion } from 'motion/react';

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreate}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {t.btnCreate} <ChevronRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
            >
              {t.btnHow}
            </motion.button>
          </div>
        </motion.div>

        {/* Right side graphic */}
        <div className="relative w-full aspect-square max-w-lg mx-auto lg:ml-auto">
          {/* Main Image Card */}
          <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col">
            <div className="relative w-full h-3/5 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                alt="Friends gathering"
                fill
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB//EACMQAAIBBAICAwAAAAAAAAAAAAECAwQREiExBRNBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCy1vHW1xZJb2q+1GicMFfkI+e5BfUrn3VvxHk1SpQgit44Y+kUYUD8AFSqU2yoAoAGBgAD3pSgD//Z"
                className="object-cover"
              />
            </div>
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
          <div className="absolute -top-6 -left-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 w-64 z-10" style={{ animation: 'ngumpulFloat 3s ease-in-out infinite' }}>
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
          <div className="absolute -bottom-6 -right-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 z-10" style={{ animation: 'ngumpulFloat 4s ease-in-out 1s infinite' }}>
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

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-zinc-100 dark:border-zinc-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">
            {language === 'id' ? 'Cara Kerja Ngumpul' : 'How Ngumpul Works'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            {language === 'id' ? 'Tiga langkah mudah untuk mewujudkan pertemuan Anda.' : 'Three simple steps to make your gathering happen.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              title: language === 'id' ? 'Buat & Bagikan' : 'Create & Share',
              desc: language === 'id' ? 'Tentukan judul, lokasi, dan rentang tanggal. Bagikan link unik ke grup chat Anda.' : 'Set a title, location, and date range. Share the unique link to your group chat.',
              icon: <Plus className="text-indigo-600" size={24} />
            },
            {
              step: '02',
              title: language === 'id' ? 'Isi Ketersediaan' : 'Fill Availability',
              desc: language === 'id' ? 'Teman Anda memilih waktu luang mereka melalui heatmap interaktif tanpa perlu login.' : 'Friends pick their free time through the interactive heatmap without needing to login.',
              icon: <Users className="text-indigo-600" size={24} />
            },
            {
              step: '03',
              title: language === 'id' ? 'Finalkan!' : 'Finalize!',
              desc: language === 'id' ? 'Lihat slot waktu terbaik dan konfirmasi. Event otomatis masuk ke kalender semua orang.' : 'See the best time slots and confirm. The event is automatically added to everyone\'s calendar.',
              icon: <CheckCircle className="text-indigo-600" size={24} />
            }
          ].map((item, i) => (
            <div
              key={i}
              className="relative p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800"
            >
              <div className="text-5xl font-black text-indigo-600/10 dark:text-indigo-400/10 absolute top-4 right-8">{item.step}</div>
              <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-zinc-100 dark:border-zinc-700">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">
          {t.featTitle}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-16">
          {t.featDesc}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
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

          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{t.feat3Title}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t.feat3Desc}</p>
          </div>

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
          {t.ctaTitle1}<br />{t.ctaTitle2}<span className="text-emerald-600 dark:text-emerald-500">{t.ctaTitle3}</span>
        </h2>
        <button
          onClick={onCreate}
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
        >
          {t.ctaBtn}
        </button>
      </section>
    </div>
  );
};

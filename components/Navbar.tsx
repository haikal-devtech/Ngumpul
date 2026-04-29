"use client";

import React, { useState } from 'react';
import { Calendar, Bell, Menu, X, Search, Moon, Sun, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, NgumpulEvent } from '../lib/types';
import { cn } from '../lib/utils';

export const Navbar = ({
  view,
  onNavigate,
  hasEvents,
  currentUser,
  theme,
  toggleTheme,
  onCreate,
  language,
  setLanguage,
  joinedEvents
}: {
  view: string,
  onNavigate: (view: string) => void,
  hasEvents: boolean,
  currentUser: UserProfile | null,
  theme: 'light' | 'dark',
  toggleTheme: () => void,
  onCreate: () => void,
  language: 'en' | 'id',
  setLanguage: (lang: 'en' | 'id') => void,
  joinedEvents: NgumpulEvent[]
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'landing', label: language === 'id' ? 'Beranda' : 'Home' },
    ...(hasEvents ? [{ id: 'dashboard', label: language === 'id' ? 'Acara Saya' : 'My Events' }] : []),
    { id: 'calendar', label: language === 'id' ? 'Kalender' : 'Calendar' },
    { id: 'teams', label: language === 'id' ? 'Tim' : 'Teams' },
    { id: 'chat', label: 'Chat' },
  ];

  const handleMobileNav = (id: string) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  return (
    <>
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

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full px-4 py-2">
            <Search size={16} className="text-zinc-400" />
            <input
              type="text"
              placeholder={language === 'id' ? "Cari acara..." : "Search events..."}
              className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
          </div>

          <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
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

          <div className="relative">
            <motion.button
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors relative shrink-0 flex items-center justify-center p-2"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950"></span>
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-[60]"
                >
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <h4 className="font-bold text-sm dark:text-white">{language === 'id' ? 'Notifikasi' : 'Notifications'}</h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer">{language === 'id' ? 'Tandai sudah dibaca' : 'Mark all as read'}</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {joinedEvents.length === 0 ? (
                      <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {language === 'id' ? 'Belum ada notifikasi baru.' : 'No new notifications.'}
                      </div>
                    ) : (
                      joinedEvents.map(evt => (
                        <div key={evt.id} onClick={() => { onNavigate('event'); setShowNotifications(false); }} className="p-3 mb-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{language === 'id' ? 'Anda diundang ke acara' : 'You are invited to event'}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{evt.title}</p>
                            <span className="text-[10px] text-zinc-400 mt-2 block">{language === 'id' ? 'Baru saja' : 'Just now'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleTheme}
            className="relative shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors overflow-hidden"
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
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: theme === 'dark' ? '#27272a' : '#f4f4f5' }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 cursor-pointer shrink-0 ml-1 sm:ml-2 bg-zinc-50 dark:bg-zinc-900 px-2 sm:px-3 py-1.5 rounded-full transition-colors border border-zinc-200 dark:border-zinc-700"
              onClick={() => onNavigate('profile')}
            >
              <img src={currentUser.photoUrl} alt="Profile" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover" />
              <span className="text-sm font-bold hidden md:block dark:text-white">{currentUser.name}</span>
            </motion.div>
          ) : (
            <button onClick={() => onNavigate('login')} className="shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ml-1 sm:ml-2">
              {language === 'id' ? 'Masuk' : 'Login'}
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreate}
            className="hidden sm:flex shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            {language === 'id' ? 'Buat Acara' : 'Create Event'}
          </motion.button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex md:hidden w-9 h-9 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[48] bg-black/20 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm z-[55] bg-white dark:bg-zinc-950 shadow-2xl md:hidden flex flex-col pt-20 px-6 pb-6 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-2">Navigation</span>
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNav(item.id)}
                      className={cn(
                        "flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-left",
                        view === item.id
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      )}
                    >
                      {item.label}
                      <ChevronRight size={18} className={cn("transition-transform", view === item.id ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Language</span>
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-full p-1">
                      <button
                        onClick={() => setLanguage('en')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded-full transition-all", language === 'en' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-mdScale" : "text-zinc-500 dark:text-zinc-400")}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage('id')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded-full transition-all", language === 'id' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-mdScale" : "text-zinc-500 dark:text-zinc-400")}
                      >
                        Bahasa
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={onCreate}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none mt-4"
                  >
                    <Plus size={20} />
                    {language === 'id' ? 'Buat Acara Baru' : 'Create New Event'}
                  </button>
                </div>
              </div>

              <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-6 flex flex-col gap-4">
                <div className="lg:flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-4 py-4 flex gap-3">
                  <Search size={18} className="text-zinc-400" />
                  <input
                    type="text"
                    placeholder={language === 'id' ? "Cari acara..." : "Search events..."}
                    className="bg-transparent border-none outline-none text-sm w-full text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

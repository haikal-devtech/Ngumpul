"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, NgumpulEvent, Team } from '../lib/types';

type AppContextType = {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  language: 'en' | 'id';
  setLanguage: (lang: 'en' | 'id') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  myEvents: NgumpulEvent[];
  setMyEvents: React.Dispatch<React.SetStateAction<NgumpulEvent[]>>;
  joinedEvents: NgumpulEvent[];
  setJoinedEvents: React.Dispatch<React.SetStateAction<NgumpulEvent[]>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [language, setLanguage] = useState<'en' | 'id'>('id');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [myEvents, setMyEvents] = useState<NgumpulEvent[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<NgumpulEvent[]>([]);

  useEffect(() => {
    const lang = localStorage.getItem('ngumpul_lang');
    if (lang) setLanguage(lang as 'en' | 'id');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newTheme;
    });
  };

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, language, setLanguage, theme, toggleTheme, myEvents, setMyEvents, joinedEvents, setJoinedEvents }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}

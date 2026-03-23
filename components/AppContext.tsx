"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, NgumpulEvent, Team, Toast } from '../lib/types';
import { startOfDay, parseISO } from 'date-fns';

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
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toasts: Toast[];
  requestNotificationPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<{lat: number, lng: number} | null>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Deduplicate array by id — prevents the same event/team appearing twice
function deduped<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [language, setLanguage] = useState<'en' | 'id'>('id');
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    loadFromStorage<'light' | 'dark'>('ngumpul_theme', 'light')
  );

  // Initialise from localStorage so state survives page navigation
  const [myEvents, setMyEventsRaw] = useState<NgumpulEvent[]>(() =>
    loadFromStorage<NgumpulEvent[]>('ngumpul_myEvents', [])
  );
  const [joinedEvents, setJoinedEventsRaw] = useState<NgumpulEvent[]>(() =>
    loadFromStorage<NgumpulEvent[]>('ngumpul_joinedEvents', [])
  );
  const [teams, setTeamsRaw] = useState<Team[]>(() =>
    loadFromStorage<Team[]>('ngumpul_teams', [])
  );
  const [currentTeam, setCurrentTeamRaw] = useState<Team | null>(() =>
    loadFromStorage<Team | null>('ngumpul_currentTeam', null)
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // ── Wrapped setters: persist + deduplicate on every write ──────────────────
  const setMyEvents: React.Dispatch<React.SetStateAction<NgumpulEvent[]>> = useCallback((action) => {
    setMyEventsRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      const clean = deduped(next);
      saveToStorage('ngumpul_myEvents', clean);
      return clean;
    });
  }, []);

  const setJoinedEvents: React.Dispatch<React.SetStateAction<NgumpulEvent[]>> = useCallback((action) => {
    setJoinedEventsRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      const clean = deduped(next);
      saveToStorage('ngumpul_joinedEvents', clean);
      return clean;
    });
  }, []);

  const setTeams: React.Dispatch<React.SetStateAction<Team[]>> = useCallback((action) => {
    setTeamsRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      const clean = deduped(next);
      saveToStorage('ngumpul_teams', clean);
      return clean;
    });
  }, []);

  const setCurrentTeam = useCallback((team: Team | null) => {
    setCurrentTeamRaw(team);
    saveToStorage('ngumpul_currentTeam', team);
  }, []);

  // ── Load language preference ───────────────────────────────────────────────
  useEffect(() => {
    const lang = localStorage.getItem('ngumpul_lang');
    if (lang) setLanguage(lang as 'en' | 'id');
  }, []);

  // ── Theme ──────────────────────────────────────────────────────────────────
  // Apply persisted theme on mount
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      saveToStorage('ngumpul_theme', next);
      if (next === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  // ── Permissions ──────────────────────────────────────────────────────────
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }, []);

  const requestLocationPermission = useCallback(async () => {
    return new Promise<{lat: number, lng: number} | null>((resolve) => {
      if (!("geolocation" in navigator)) {
        addToast("Browser tidak mendukung geolokasi", "error");
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          addToast("Akses lokasi ditolak", "error");
          resolve(null);
        }
      );
    });
  }, [addToast]);

  // ── Event Reminders ───────────────────────────────────────────────────────
  useEffect(() => {
    const checkReminders = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      
      const allEvents = [...myEvents, ...joinedEvents];
      const today = startOfDay(new Date());
      
      allEvents.forEach(event => {
        if (event.status === 'cancelled') return;
        
        // Find if any confirmed slot is today
        const isToday = event.confirmedSlot && startOfDay(parseISO(event.confirmedSlot)).getTime() === today.getTime();

        if (isToday) {
          const remindedKey = `reminded_${event.id}_${today.toISOString()}`;
          if (!localStorage.getItem(remindedKey)) {
            new Notification(language === 'id' ? "Pengingat Acara!" : "Event Reminder!", {
              body: language === 'id' ? `Hari ini: ${event.title}` : `Today: ${event.title}`,
              icon: '/icon.png'
            });
            localStorage.setItem(remindedKey, 'true');
          }
        }
      });
    };

    // Check on mount and every hour
    checkReminders();
    const interval = setInterval(checkReminders, 3600000);
    return () => clearInterval(interval);
  }, [myEvents, joinedEvents, language]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      language, setLanguage,
      theme, toggleTheme,
      myEvents, setMyEvents,
      joinedEvents, setJoinedEvents,
      teams, setTeams,
      currentTeam, setCurrentTeam,
      toasts, addToast,
      requestNotificationPermission,
      requestLocationPermission,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}

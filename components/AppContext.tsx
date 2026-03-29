"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  findTeamByInviteCode: (code: string) => Team | undefined;
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialise from localStorage so state survives page navigation
  const [myEvents, setMyEventsRaw] = useState<NgumpulEvent[]>([]);
  const [joinedEvents, setJoinedEventsRaw] = useState<NgumpulEvent[]>([]);
  const [teams, setTeamsRaw] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeamRaw] = useState<Team | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    setTheme(loadFromStorage('ngumpul_theme', 'light'));
    setMyEventsRaw(loadFromStorage<NgumpulEvent[]>('ngumpul_myEvents', []));
    setJoinedEventsRaw(loadFromStorage<NgumpulEvent[]>('ngumpul_joinedEvents', []));
    setTeamsRaw(loadFromStorage<Team[]>('ngumpul_teams', []));
    setCurrentTeamRaw(loadFromStorage<Team | null>('ngumpul_currentTeam', null));
    setHydrated(true);
  }, []);

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

  // ── Sync currentTeam when teams array changes ─────────────────────────────
  // This ensures that when a member joins via the join page and updates the
  // teams array, the currentTeam view also reflects the updated member list.
  useEffect(() => {
    if (!hydrated) return;
    setCurrentTeamRaw(prev => {
      if (!prev) return null;
      const updated = teams.find(t => t.id === prev.id);
      if (!updated) return null;
      // Only update if members actually changed (avoid infinite loops)
      if (JSON.stringify(updated.members) === JSON.stringify(prev.members) &&
          updated.name === prev.name) {
        return prev;
      }
      saveToStorage('ngumpul_currentTeam', updated);
      return updated;
    });
  }, [teams, hydrated]);

  // ── Cross-tab localStorage sync ───────────────────────────────────────────
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ngumpul_teams' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Team[];
          setTeamsRaw(deduped(parsed));
        } catch {}
      }
      if (e.key === 'ngumpul_currentTeam' && e.newValue) {
        try {
          setCurrentTeamRaw(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ── Find team by invite code ──────────────────────────────────────────────
  const findTeamByInviteCode = useCallback((code: string): Team | undefined => {
    return teams.find(t => t.inviteCode === code);
  }, [teams]);

  // ── Load language preference ───────────────────────────────────────────────
  useEffect(() => {
    const lang = localStorage.getItem('ngumpul_lang');
    if (lang) setLanguage(lang as 'en' | 'id');
  }, []);

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

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
    if (!hydrated) return;
    const checkReminders = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      
      const allEvents = [...myEvents, ...joinedEvents];
      const today = startOfDay(new Date());
      
      allEvents.forEach(event => {
        if (event.status === 'cancelled') return;
        
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

    checkReminders();
    const interval = setInterval(checkReminders, 3600000);
    return () => clearInterval(interval);
  }, [myEvents, joinedEvents, language, hydrated]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      language, setLanguage,
      theme, toggleTheme,
      myEvents, setMyEvents,
      joinedEvents, setJoinedEvents,
      teams, setTeams,
      currentTeam, setCurrentTeam,
      findTeamByInviteCode,
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

"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "./AppContext";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ToastContainer } from "./ToastContainer";
import { motion, AnimatePresence } from "motion/react";

export default function AppLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, language, setLanguage, theme, toggleTheme, myEvents, joinedEvents, toasts } = useAppContext();


  // Map route to internal 'view' state used by original Nav
  const getViewFromPath = () => {
    if (pathname === "/") return "landing";
    if (pathname.includes("/dashboard")) return "dashboard";
    if (pathname.includes("/event/new")) return "create";
    if (pathname.includes("/event/")) return "event";
    if (pathname.includes("/teams")) return "teams";
    if (pathname.includes("/calendar")) return "calendar";
    if (pathname.includes("/chat")) return "chat";
    return "landing";
  };

  const handleNavigate = (view: string) => {
    switch (view) {
      case "landing": router.push("/"); break;
      case "dashboard": router.push("/dashboard"); break;
      case "create": router.push("/event/new"); break;
      case "teams": router.push("/teams"); break;
      case "calendar": router.push("/calendar"); break;
      case "chat": router.push("/chat"); break;
      case "login": router.push("/login"); break;
      case "profile": router.push("/profile"); break;
      default: router.push(`/${view}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        view={getViewFromPath()}
        onNavigate={handleNavigate}
        hasEvents={myEvents.length > 0 || joinedEvents.length > 0}
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        onCreate={() => router.push("/event/new")}
        language={language}
        setLanguage={setLanguage}
        joinedEvents={joinedEvents}
      />
      <main className="flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {pathname === '/' && (
        <Footer 
          onNavigate={handleNavigate} 
          language={language}
        />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "./AppContext";
import { Navbar, Footer } from "./NgumpulApp";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, language, setLanguage, theme, toggleTheme, myEvents, joinedEvents } = useAppContext();

  // Map route to internal 'view' state used by original Nav
  const getViewFromPath = () => {
    if (pathname === "/") return "landing";
    if (pathname.includes("/dashboard")) return "dashboard";
    if (pathname.includes("/event/new")) return "create";
    if (pathname.includes("/event/")) return "event";
    if (pathname.includes("/teams")) return "teams";
    if (pathname.includes("/calendar")) return "calendar";
    return "landing";
  };

  const handleNavigate = (view: string) => {
    switch (view) {
      case "landing": router.push("/"); break;
      case "dashboard": router.push("/dashboard"); break;
      case "create": router.push("/event/new"); break;
      case "teams": router.push("/teams"); break;
      case "calendar": router.push("/calendar"); break;
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
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer 
        onNavigate={handleNavigate} 
        language={language}
      />
    </div>
  );
}

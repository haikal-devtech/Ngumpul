"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppContext } from "./AppContext";
import { Navbar, Footer, ToastContainer } from "./NgumpulApp";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { currentUser, setCurrentUser, language, setLanguage, theme, toggleTheme, myEvents, joinedEvents, toasts } = useAppContext();

  useEffect(() => {
    if (session?.user && !currentUser) {
      setCurrentUser({
        id: session.user.id || session.user.email || "user",
        name: session.user.name || "User",
        email: session.user.email || "",
        bio: "",
        photoUrl: session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`,
      });
    } else if (status === "unauthenticated" && currentUser) {
      setCurrentUser(null);
    }
  }, [session, status, currentUser, setCurrentUser]);

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
      <ToastContainer toasts={toasts} />
    </div>
  );
}

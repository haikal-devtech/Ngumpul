"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Dashboard } from "@/components/NgumpulApp";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/AppContext";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { language, myEvents, joinedEvents, setMyEvents, setJoinedEvents } = useAppContext();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Show loading state while session is resolving — never render data before auth confirmed
  if (status === "loading" || status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSelectEvent = (event: any) => {
    router.push(`/event/${event.id}`);
  };

  const handleEditEvent = (event: any) => {
    router.push(`/event/${event.id}/edit`);
  };

  const handleDeleteEvent = (id: string) => {
    setMyEvents((prev) => prev.filter((e) => e.id !== id));
    setJoinedEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <Dashboard 
      myEvents={myEvents.filter(e => !e.teamId)} 
      joinedEvents={joinedEvents} 
      onSelectEvent={handleSelectEvent}
      onCreateNew={() => router.push("/event/new")}
      onDeleteEvent={handleDeleteEvent}
      onEditEvent={handleEditEvent}
      language={language}
    />
  );
}

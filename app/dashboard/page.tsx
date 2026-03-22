"use client";

import { Dashboard } from "@/components/NgumpulApp";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/AppContext";

export default function DashboardPage() {
  const router = useRouter();
  const { language, myEvents, joinedEvents, setMyEvents, setJoinedEvents } = useAppContext();

  const handleSelectEvent = (event: any) => {
    router.push(`/event/${event.id}`);
  };

  const handleEditEvent = (event: any) => {
    // Advanced: could pass initialEvent state, but simplified here
    router.push(`/event/${event.id}/edit`);
  };

  const handleDeleteEvent = (id: string) => {
    setMyEvents((prev) => prev.filter((e) => e.id !== id));
    setJoinedEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <Dashboard 
      myEvents={myEvents} 
      joinedEvents={joinedEvents} 
      onSelectEvent={handleSelectEvent}
      onCreateNew={() => router.push("/event/new")}
      onDeleteEvent={handleDeleteEvent}
      onEditEvent={handleEditEvent}
      language={language}
    />
  );
}

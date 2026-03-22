"use client";

import { use } from "react";
import { EventPage } from "@/components/NgumpulApp";
import { useAppContext } from "@/components/AppContext";

export default function EventDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { myEvents, joinedEvents, setMyEvents, setJoinedEvents, currentUser, language } = useAppContext();

  const allEvents = [...myEvents, ...joinedEvents];
  const event = allEvents.find((e) => e.id === slug);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold dark:text-white">Event not found or you don't have access.</h1>
      </div>
    );
  }

  const handleUpdate = (updatedEvent: any) => {
    if (myEvents.some(e => e.id === updatedEvent.id)) {
      setMyEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    } else {
      setJoinedEvents(prev => {
        if (!prev.some(e => e.id === updatedEvent.id)) return [updatedEvent, ...prev];
        return prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
      });
    }
  };

  return (
    <EventPage 
      event={event} 
      currentUser={currentUser} 
      language={language} 
      onUpdateEvent={handleUpdate} 
    />
  );
}

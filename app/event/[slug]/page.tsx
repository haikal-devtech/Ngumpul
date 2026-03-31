"use client";

import { use, useEffect, useState } from "react";
import { EventPage } from "@/components/NgumpulApp";
import { useAppContext } from "@/components/AppContext";
import { NgumpulEvent } from "@/lib/types";

export default function EventDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { myEvents, joinedEvents, setMyEvents, setJoinedEvents, currentUser, language } = useAppContext();

  const [fetchedEvent, setFetchedEvent] = useState<NgumpulEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const allEvents = [
    ...myEvents.map(e => ({ ...e, role: 'host' as const })),
    ...joinedEvents.map(e => ({ ...e, role: 'guest' as const }))
  ];
  
  const localEvent = allEvents.find((e) => e.id === slug);
  const event = localEvent || fetchedEvent;

  useEffect(() => {
    // 1. Immediately unset loading if localCache is ready (fast UX)
    if (localEvent) setLoading(false);
    else setLoading(true);

    // 2. Always fetch fully fresh data from the server in the background
    fetch(`/api/events/${slug}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then(data => {
        setFetchedEvent(data);
        setLoading(false);

        // Update local context so the rest of the app stays in sync
        if (myEvents.some(e => e.id === data.id)) {
          setMyEvents(prev => prev.map(e => e.id === data.id ? { ...data, teamId: e.teamId, role: e.role } : e));
        } else {
          setJoinedEvents(prev => {
            if (!prev.some(e => e.id === data.id)) return [{ ...data, role: 'guest' }, ...prev];
            return prev.map(e => e.id === data.id ? { ...data, teamId: e.teamId, role: e.role } : e);
          });
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>;
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold dark:text-white">Event not found or you don't have access.</h1>
      </div>
    );
  }

  const handleUpdate = (updatedEvent: any) => {
    // Optimistic UI Update (LocalStorage)
    if (myEvents.some(e => e.id === updatedEvent.id)) {
      setMyEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    } else {
      setJoinedEvents(prev => {
        if (!prev.some(e => e.id === updatedEvent.id)) return [updatedEvent, ...prev];
        return prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
      });
    }

    // Synchronize full event state with the database
    fetch(`/api/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    }).catch(err => console.error("Failed to sync event", err));
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

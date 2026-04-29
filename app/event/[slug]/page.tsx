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
  // Ensure dates is always an array
  const safeLocalEvent = localEvent ? {
    ...localEvent,
    dates: Array.isArray(localEvent.dates) ? localEvent.dates : [],
    participants: Array.isArray(localEvent.participants) ? localEvent.participants : []
  } : null;
  const event = fetchedEvent || safeLocalEvent;

  useEffect(() => {
    // 1. If we have nothing locally, show loading immediately
    if (!localEvent && !fetchedEvent) setLoading(true);
    else if (localEvent && !fetchedEvent) setLoading(false); // fast UX with local cache

    // 2. Always fetch fully fresh data from the server
    fetch(`/api/events/${slug}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then(data => {
        // Ensure dates is always an array to prevent crashes
        const safeData = {
          ...data,
          dates: Array.isArray(data.dates) ? data.dates : [],
          participants: Array.isArray(data.participants) ? data.participants : []
        };
        setFetchedEvent(safeData);
        setLoading(false);

        // Update local context so the rest of the app stays in sync
        const isHost = data.role === 'host' || data.host_id === currentUser?.id;
        
        if (isHost) {
          // Ensure it's in myEvents and removed from joinedEvents (if it was there by mistake)
          setMyEvents(prev => {
            const exists = prev.some(e => e.id === data.id || (data.slug && e.id === data.slug));
            if (exists) {
              return prev.map(e => (e.id === data.id || (data.slug && e.id === data.slug)) ? { ...e, ...data } : e);
            }
            return [data, ...prev];
          });
          setJoinedEvents(prev => prev.filter(e => e.id !== data.id && (!data.slug || e.id !== data.slug)));
        } else {
          // Ensure it's in joinedEvents and removed from myEvents
          setJoinedEvents(prev => {
            const exists = prev.some(e => e.id === data.id || (data.slug && e.id === data.slug));
            if (exists) {
              return prev.map(e => (e.id === data.id || (data.slug && e.id === data.slug)) ? { ...e, ...data } : e);
            }
            return [data, ...prev];
          });
          setMyEvents(prev => prev.filter(e => e.id !== data.id && (!data.slug || e.id !== data.slug)));
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [slug, currentUser?.id]);

  if (loading && !event) {
    return <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>;
  }

  if (!event && !loading) {
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

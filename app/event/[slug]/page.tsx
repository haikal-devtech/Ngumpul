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
    if (!slug) return;

    // 1. Initial Loading State
    if (!localEvent && !fetchedEvent) setLoading(true);
    else if (localEvent && !fetchedEvent) setLoading(false);

    // 2. Real-time Listener for the Event document
    const { db } = require("@/lib/firebase");
    const { doc, onSnapshot, collection } = require("firebase/firestore");
    
    // We listen to the event document AND its participants subcollection
    const eventRef = doc(db, "events", slug); // Assuming slug is used as ID or we need to find by slug
    
    // Since slug might not be the doc ID, we first fetch by slug to get the ID
    let unsubParticipants: (() => void) | null = null;

    const fetchAndListen = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const initialData = await res.json();
        
        const safeData = {
          ...initialData,
          dates: Array.isArray(initialData.dates) ? initialData.dates : [],
          participants: Array.isArray(initialData.participants) ? initialData.participants : []
        };
        setFetchedEvent(safeData);
        setLoading(false);

        // Now listen to the participants subcollection for real-time updates
        const participantsCol = collection(db, "events", initialData.id, "participants");
        unsubParticipants = onSnapshot(participantsCol, (snapshot: any) => {
          const updatedParticipants = snapshot.docs.map((doc: any) => {
            const p = doc.data();
            return {
              id: p.user_id || doc.id,
              name: p.guest_name || 'Anonymous',
              availability: p.availability || [],
              photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.guest_name || 'Anonymous'}`
            };
          });

          setFetchedEvent(prev => prev ? { ...prev, participants: updatedParticipants } : null);
        });
      } catch (err) {
        console.error("Listener setup error:", err);
        setLoading(false);
      }
    };

    fetchAndListen();

    return () => {
      if (unsubParticipants) unsubParticipants();
    };
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

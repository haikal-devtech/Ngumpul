"use client";

import { CreateEvent } from "@/components/NgumpulApp";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/components/AppContext";
import { NgumpulEvent } from "@/lib/types";
import { Suspense } from "react";

function NewEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId") || undefined;
  const { language, setMyEvents } = useAppContext();

  const handleSaved = async (event: NgumpulEvent) => {
    // Add to context first so UI is instant
    setMyEvents((prev) => [event, ...prev]);
    router.push(`/event/${event.id}`);

    // Fire API in background (best-effort — auth may fail in dev)
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        date_range: event.dates,
        time_range: [event.startTime, event.endTime],
      }),
    }).catch(() => {}); // silent — dedup guard in AppContext prevents doubles
  };

  return (
    <CreateEvent 
      onSaved={handleSaved} 
      language={language} 
      teamId={teamId}
    />
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <NewEventForm />
    </Suspense>
  );
}

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
  const { language, setMyEvents, currentUser, addToast } = useAppContext();

  const handleSaved = async (event: NgumpulEvent) => {
    if (!currentUser) {
      addToast(language === 'id' ? "Silakan masuk untuk menyimpan acara." : "Please log in to save events.", "error");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...event,
          slug: event.id,
          location_name: event.location,
          date_range: event.dates,
          time_range: [event.startTime, event.endTime],
        }),
      });

      if (!res.ok) throw new Error("API Save failed");

      // Add to context after successful save
      setMyEvents((prev) => [event, ...prev]);
      router.push(`/event/${event.id}`);
    } catch (e: any) {
      addToast(language === 'id' ? "Gagal menyimpan acara." : "Failed to save the event.", "error");
    }
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

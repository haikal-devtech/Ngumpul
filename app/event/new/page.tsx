"use client";

import { CreateEvent } from "@/components/NgumpulApp";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/components/AppContext";
import { NgumpulEvent } from "@/lib/types";
import { Suspense, useEffect } from "react";

function NewEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId") || undefined;
  const { language, setMyEvents, currentUser, addToast } = useAppContext();

  // Block unauthenticated users from accessing the create form
  useEffect(() => {
    if (currentUser === null) {
      addToast(language === 'id' ? "Silakan masuk untuk membuat acara." : "Please log in to create events.", "error");
      router.replace("/login");
    }
  }, [currentUser, router, addToast, language]);

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

  // Don't render the form if the user is not logged in
  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

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

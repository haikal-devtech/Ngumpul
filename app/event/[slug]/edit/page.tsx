"use client";

import { CreateEvent } from "@/components/NgumpulApp";
import { useRouter, useParams } from "next/navigation";
import { useAppContext } from "@/components/AppContext";
import { NgumpulEvent } from "@/lib/types";

export default function EditEventPage() {
  const router = useRouter();
  const { slug } = useParams();
  const { language, myEvents, setMyEvents } = useAppContext();

  const event = myEvents.find((e) => e.id === slug);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-indigo-600 font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleUpdate = async (updatedEvent: NgumpulEvent) => {
    setMyEvents((prev) => 
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    router.push(`/event/${updatedEvent.id}`);

    // API update (optional/best-effort)
    fetch(`/api/events/${updatedEvent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updatedEvent,
        date_range: updatedEvent.dates,
        time_range: [updatedEvent.startTime, updatedEvent.endTime],
      }),
    }).catch(() => {});
  };

  return (
    <CreateEvent 
      initialEvent={event}
      onSaved={handleUpdate} 
      language={language} 
    />
  );
}

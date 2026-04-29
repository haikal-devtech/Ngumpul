import { NgumpulEvent } from "./types";
import { format, parseISO } from "date-fns";

/**
 * Generates an iCalendar (.ics) format string for a given event.
 */
export function generateICS(event: NgumpulEvent): string {
  const now = new Date();
  const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
  
  // Use the first date in the array for start/end if available
  const eventDate = event.dates[0] ? parseISO(event.dates[0]) : now;
  const dateStr = format(eventDate, "yyyyMMdd");
  
  const startTime = event.startTime.replace(":", "") + "00";
  const endTime = event.endTime.replace(":", "") + "00";
  
  const start = `${dateStr}T${startTime}`;
  const end = `${dateStr}T${endTime}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ngumpul//NONSGML Event Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@ngumpul.com`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ""}`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

/**
 * Adds an event to the user's primary Google Calendar via REST API.
 * Requires a valid Google Access Token with calendar.events scope.
 */
export async function addToGoogleCalendar(event: NgumpulEvent, accessToken: string) {
  const eventDate = event.dates[0] || format(new Date(), "yyyy-MM-dd");
  
  const gEvent = {
    summary: event.title,
    description: event.description,
    location: event.location,
    start: {
      dateTime: `${eventDate}T${event.startTime}:00`,
      timeZone: "Asia/Jakarta", // Should ideally use event.timezone if available
    },
    end: {
      dateTime: `${eventDate}T${event.endTime}:00`,
      timeZone: "Asia/Jakarta",
    },
  };

  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gEvent),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to add to Google Calendar");
  }

  return response.json();
}

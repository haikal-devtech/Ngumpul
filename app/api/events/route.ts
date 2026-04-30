import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { createEvent, getEventsByHost } from "@/lib/firestore-admin-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = rateLimit(`events:create:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const body = await req.json();
    const { title, desc, location_name, location_address, lat, lng, place_id, date_range, time_range, timezone, deadline, slug, team_id } = body;

    const eventDateRange = Array.isArray(date_range) && date_range.length > 0 ? date_range : [];
    const eventTimeRange = Array.isArray(time_range) && time_range.length > 0 ? time_range : ["09:00", "21:00"];

    const event = await createEvent({
      slug: slug || Math.random().toString(36).substr(2, 9),
      title,
      desc,
      location_name,
      location_address,
      lat,
      lng,
      place_id,
      date_range: eventDateRange,
      time_range: eventTimeRange,
      timezone: timezone || "Asia/Jakarta",
      deadline: deadline ? new Date(deadline) : null,
      host_id: session.user.id,
      team_id: team_id || null,
      status: "active",
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
      console.log("DEBUG: [GET /api/events] Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("DEBUG: [GET /api/events] Fetching events for user:", session.user.id);
    const events = await getEventsByHost(session.user.id);
    console.log(`DEBUG: [GET /api/events] Found ${events.length} events.`);

    const mappedEvents = events.map((event: any) => {
      try {
        const dateRange = event.date_range ?? [];
        const timeRange = event.time_range ?? [];
        return {
          ...event,
          id: event.slug || event.id,
          slug: event.slug || event.id,
          teamId: event.team_id || undefined,
          description: event.desc || '',
          location: event.location_name || '',
          dates: Array.isArray(dateRange) ? dateRange : [],
          startTime: Array.isArray(timeRange) ? timeRange[0] || "09:00" : "09:00",
          endTime: Array.isArray(timeRange) ? timeRange[1] || "21:00" : "21:00",
        };
      } catch (mapError: any) {
        console.error("DEBUG: [GET /api/events] Error mapping event:", event.id, mapError.message);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json(mappedEvents, { status: 200 });
  } catch (error: any) {
    console.error("DEBUG: [GET /api/events] CRITICAL ERROR:", error.message, error.stack);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}


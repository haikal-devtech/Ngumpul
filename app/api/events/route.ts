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
    console.log("DEBUG: [POST /api/events] Received body:", JSON.stringify(body));
    
    const { title, desc, location_name, location_address, lat, lng, place_id, date_range, time_range, timezone, deadline, slug, team_id } = body;

    const eventDateRange = Array.isArray(date_range) && date_range.length > 0 ? date_range : [];
    const eventTimeRange = Array.isArray(time_range) && time_range.length > 0 ? time_range : ["09:00", "21:00"];

    // Handle deadline date safely
    let finalDeadline = null;
    if (deadline) {
      const d = new Date(deadline);
      if (!isNaN(d.getTime())) {
        finalDeadline = d;
      }
    }

    console.log("DEBUG: [POST /api/events] Creating event in Firestore...");
    const event = await createEvent({
      slug: slug || Math.random().toString(36).substr(2, 9),
      title: title || "Untitled Event",
      desc: desc || "",
      location_name: location_name || "",
      location_address: location_address || "",
      lat: lat || 0,
      lng: lng || 0,
      place_id: place_id || "",
      date_range: eventDateRange,
      time_range: eventTimeRange,
      timezone: timezone || "Asia/Jakarta",
      deadline: finalDeadline,
      host_id: session.user.id,
      team_id: team_id || null,
      status: "active",
    });

    console.log("DEBUG: [POST /api/events] Event created SUCCESS:", event.id);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("DEBUG: [POST /api/events] FAILED:", error.message, error.stack);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
      console.log("DEBUG: [GET /api/events] Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamIdsParam = searchParams.get("teamIds");
    
    let events: any[] = [];
    
    // Fetch user's hosted events
    const hostEvents = await getEventsByHost(session.user.id);
    events = [...hostEvents];

    // If teamIds are provided, fetch those too
    if (teamIdsParam) {
      const teamIds = teamIdsParam.split(",").filter(Boolean);
      for (const teamId of teamIds) {
        const teamEvents = await getEventsByTeam(teamId);
        // Avoid duplicates if user is host of a team event
        for (const te of teamEvents) {
          if (!events.some(e => e.id === te.id)) {
            events.push(te);
          }
        }
      }
    }
    
    console.log(`DEBUG: [GET /api/events] Found total ${events.length} events.`);

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


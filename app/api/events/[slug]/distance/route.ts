import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug, getParticipantLocations } from "@/lib/firestore-utils";
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getDistanceMatrix } from "@/lib/maps";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const { success } = rateLimit(`distance:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const { slug } = await params;

    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.host_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!event.lat || !event.lng) {
      return NextResponse.json(
        { error: "Event location not set or coordinates missing" },
        { status: 400 }
      );
    }

    const participants = await getParticipantLocations(event.id);

    const travelTimes = await Promise.all(
      participants.map(async (p: any) => {
        if (!p.lat || !p.lng) return null;
        try {
          const matrix = await getDistanceMatrix(
            { lat: p.lat, lng: p.lng },
            { lat: event.lat!, lng: event.lng! }
          );
          return {
            participantId: p.id,
            name: p.guest_name || "Guest",
            origin: p.location_name,
            ...matrix
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json(travelTimes.filter(Boolean));
  } catch (error: any) {
    console.error("Error calculating travel times:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


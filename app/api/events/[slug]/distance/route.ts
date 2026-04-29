import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getDistanceMatrix } from "@/lib/maps";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // ── Auth gate ──────────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limit: 5 requests / 60s per IP ───────────────────────────────
    const ip = getClientIp(req);
    const { success } = rateLimit(`distance:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const { slug } = await params;

    // 1. Fetch event and verify the current user is the host
    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true, lat: true, lng: true, location_name: true, host_id: true }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // ── Ownership check: only the event host may view travel distances ─────
    if (event.host_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!event.lat || !event.lng) {
      return NextResponse.json(
        { error: "Event location not set or coordinates missing" },
        { status: 400 }
      );
    }

    // 2. Fetch all participant origins
    const participants = await prisma.participantLocation.findMany({
      where: { event_id: event.id },
      include: {
        participant: { select: { guest_name: true, user: { select: { name: true } } } }
      }
    });

    // 3. Calculate distances
    const travelTimes = await Promise.all(
      participants.map(async (p) => {
        if (!p.lat || !p.lng) return null;
        try {
          const matrix = await getDistanceMatrix(
            { lat: p.lat, lng: p.lng },
            { lat: event.lat!, lng: event.lng! }
          );
          return {
            participantId: p.participant_id,
            name: p.participant.user?.name || p.participant.guest_name || "Guest",
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

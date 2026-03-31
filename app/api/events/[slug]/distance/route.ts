import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDistanceMatrix } from "@/lib/maps";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Fetch event destination
    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true, lat: true, lng: true, location_name: true }
    });

    if (!event?.lat || !event?.lng) {
      return NextResponse.json({ error: "Event location not set or coordinates missing" }, { status: 400 });
    }

    // 2. Fetch all participant origins
    const participants = await prisma.participantLocation.findMany({
      where: { event_id: event.id },
      include: { participant: { select: { guest_name: true, user: { select: { name: true } } } } }
    });

    // 3. Calculate distances (In a real app, you might want to cache this or batch requests)
    const travelTimes = await Promise.all(participants.map(async (p) => {
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
      } catch (err) {
        return null;
      }
    }));

    return NextResponse.json(travelTimes.filter(Boolean));
  } catch (error: any) {
    console.error("Error calculating travel times:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

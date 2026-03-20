import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { guest_name, slots } = await req.json(); // slots: string[] (ISO strings or identifiers)

    if (!guest_name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        event_id: event.id,
        guest_name,
      },
    });

    // Create availabilities
    if (slots && slots.length > 0) {
      await prisma.availability.createMany({
        data: slots.map((slot: string) => ({
          participant_id: participant.id,
          event_id: event.id,
          slot_datetime: new Date(slot),
          is_available: true,
        })),
      });
    }

    return NextResponse.json({ success: true, participant });
  } catch (error) {
    console.error("Error submitting availability:", error);
    return NextResponse.json({ error: "Failed to submit availability" }, { status: 500 });
  }
}

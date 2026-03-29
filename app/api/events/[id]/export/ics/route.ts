import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateICS } from "@/lib/calendar";
import { NgumpulEvent } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const eventData = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Map Prisma models to NgumpulEvent type
    const event: NgumpulEvent = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.desc || undefined,
      location: eventData.location_name || undefined,
      dates: eventData.date_range,
      startTime: eventData.time_range[0] || "09:00",
      endTime: eventData.time_range[1] || "17:00",
      participants: eventData.participants.map(p => ({
        id: p.id,
        name: p.user?.name || p.guest_name || "Unknown",
        availability: [] // Not needed for ICS export
      }))
    };

    const icsContent = generateICS(event);

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="${eventData.slug}.ics"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting ICS:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

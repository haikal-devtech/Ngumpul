import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/firestore-admin-utils";
import { generateICS } from "@/lib/calendar";
import { NgumpulEvent } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const eventData = await getEventBySlug(slug);

    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event: NgumpulEvent = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.desc || undefined,
      location: eventData.location_name || undefined,
      dates: eventData.date_range,
      startTime: eventData.time_range[0] || "09:00",
      endTime: eventData.time_range[1] || "17:00",
      participants: (eventData.participants || []).map((p: any) => ({
        id: p.id,
        name: p.guest_name || "Unknown",
        availability: []
      }))
    };

    const icsContent = generateICS(event);

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="${slug}.ics"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting ICS:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


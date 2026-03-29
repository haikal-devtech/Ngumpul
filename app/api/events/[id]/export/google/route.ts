import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { addToGoogleCalendar } from "@/lib/calendar";
import { NgumpulEvent } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch the event
    const eventData = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: { include: { user: { select: { name: true } } } }
      }
    });

    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 2. Fetch Google OAuth Access Token for the current user
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google"
      }
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: "Google account not connected or missing permissions" }, { status: 400 });
    }

    // 3. Map to NgumpulEvent type
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
        availability: []
      }))
    };

    // 4. Call Google API
    await addToGoogleCalendar(event, account.access_token);

    return NextResponse.json({ success: true, message: "Event added to Google Calendar" });
  } catch (error: any) {
    console.error("Error adding to Google Calendar:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

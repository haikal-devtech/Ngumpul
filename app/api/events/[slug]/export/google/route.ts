import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug, getUserProfile } from "@/lib/firestore-utils";
import { auth } from "@/auth";
import { addToGoogleCalendar } from "@/lib/calendar";
import { NgumpulEvent } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const eventData = await getEventBySlug(slug);

    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Note: In Firebase migration, we need to handle Google OAuth tokens differently.
    // For now, this is a placeholder. In a real app, you'd store the token in Firestore
    // or fetch it from the Firebase Auth user metadata if using specific providers.
    const userProfile = await getUserProfile(session.user.id);
    const accessToken = (userProfile as any)?.googleAccessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Google account not connected or missing permissions" }, { status: 400 });
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

    await addToGoogleCalendar(event, accessToken);

    return NextResponse.json({ success: true, message: "Event added to Google Calendar" });
  } catch (error: any) {
    console.error("Error adding to Google Calendar:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}


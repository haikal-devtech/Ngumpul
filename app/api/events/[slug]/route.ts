import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { 
  getEventBySlug, 
  updateEvent, 
  upsertParticipant, 
  getParticipantByGuestName 
} from "@/lib/firestore-admin-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const session = await getServerSession();


    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isHost = session?.user?.id === event.host_id;

    const dateRange = event.date_range ?? [];
    const timeRange = event.time_range ?? [];

    const mappedEvent = {
      ...event,
      id: event.id, // Use the actual Firestore Doc ID, not the slug
      slug: event.slug,
      role: isHost ? 'host' : 'guest',
      dates: Array.isArray(dateRange) ? dateRange : [],
      startTime: Array.isArray(timeRange) ? timeRange[0] || "09:00" : "09:00",
      endTime: Array.isArray(timeRange) ? timeRange[1] || "21:00" : "21:00",
      participants: (event.participants || []).map((p: any) => ({
        id: p.user_id || p.id,
        name: p.guest_name || 'Anonymous',
        availability: p.availability || [],
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.guest_name || 'Anonymous'}`
      }))
    };

    return NextResponse.json(mappedEvent, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const session = await getServerSession();

    const body = await req.json();
    
    const event = await getEventBySlug(slug);
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isHost = session?.user?.id === event.host_id;

    if (isHost) {
      await updateEvent(event.id, {
        confirmed_slot: body.confirmedSlot !== undefined ? (body.confirmedSlot || null) : event.confirmed_slot,
        status: body.status !== undefined ? body.status : event.status,
        team_id: body.teamId !== undefined ? (body.teamId || null) : event.team_id,
        title: body.title,
        desc: body.description,
      });
    }

    if (body.participants && Array.isArray(body.participants)) {
      for (const p of body.participants) {
        const participantId = p.id;
        if (!participantId) continue;

        await upsertParticipant(event.id, participantId, {
          user_id: participantId.startsWith('guest-') ? null : participantId,
          guest_name: p.name || 'Anonymous',
          availability: p.availability || [],
          updatedAt: new Date()
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error syncing event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


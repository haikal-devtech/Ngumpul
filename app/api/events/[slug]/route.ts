import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        participants: {
          include: {
            availabilities: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Map Prisma model to NgumpulEvent structure needed by the frontend
    const mappedEvent = {
      id: event.slug,
      title: event.title,
      description: event.desc || '',
      location: event.location_name || '',
      dates: event.date_range || [],
      startTime: event.time_range ? (event.time_range as string[])[0] : "09:00",
      endTime: event.time_range ? (event.time_range as string[])[1] : "21:00",
      status: 'active',
      role: 'guest', // Defaults to guest for anyone loading via API link
      confirmedSlot: event.confirmed_slot || undefined,
      participants: event.participants.map(p => ({
        id: p.user_id || p.id, // Fallback to participant node ID if guest
        name: p.guest_name || 'Anonymous',
        availability: p.availabilities.filter(a => a.is_available).map(a => a.slot_datetime),
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
    const body = await req.json();
    
    const event = await prisma.event.findUnique({
      where: { slug }
    });
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update event core data
      await tx.event.update({
        where: { id: event.id },
        data: {
          confirmed_slot: body.confirmedSlot || null,
          title: body.title,
          desc: body.description,
        }
      });

      // 2. Clear old participants (cascade deletes their availabilities)
      await tx.participant.deleteMany({
        where: { event_id: event.id }
      });

      // 3. Insert new participants
      if (body.participants && Array.isArray(body.participants)) {
        for (const p of body.participants) {
          await tx.participant.create({
            data: {
              event_id: event.id,
              user_id: (p.id && (p.id.startsWith("mock") || p.id.length < 15)) ? null : p.id,
              guest_name: p.name,
              availabilities: {
                create: (p.availability || []).map((slot: string) => ({
                  slot_datetime: slot,
                  is_available: true
                }))
              }
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error syncing event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

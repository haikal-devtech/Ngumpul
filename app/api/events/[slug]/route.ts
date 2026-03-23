import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const event = await prisma.event.findUnique({
      where: { slug }
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
      participants: [],
      status: 'active',
      role: 'guest' // Defaults to guest for anyone loading via API link
    };

    return NextResponse.json(mappedEvent, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, desc, location_name, location_address, lat, lng, place_id, date_range, time_range, timezone, deadline, slug } = body;

    const event = await prisma.event.create({
      data: {
        slug: slug || Math.random().toString(36).substr(2, 9),
        title,
        desc,
        location_name,
        location_address,
        lat,
        lng,
        place_id,
        date_range,
        time_range: time_range || ["09:00", "21:00"],
        timezone: timezone || "Asia/Jakarta",
        deadline: deadline ? new Date(deadline) : null,
        host_id: session.user.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { host_id: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

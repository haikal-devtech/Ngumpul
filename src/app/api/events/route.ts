import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { title, description, location_name, date_range, time_range } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = `${title.toLowerCase().replace(/ /g, "-")}-${uuidv4().slice(0, 8)}`;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location_name,
        date_range,
        time_range,
        slug,
      },
    });

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event", details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events", details: error.message }, { status: 500 });
  }
}

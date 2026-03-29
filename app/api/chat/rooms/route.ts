import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET /api/chat/rooms — list rooms (public for guests, filtered for members)
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const rooms = await prisma.chatRoom.findMany({
      include: {
        _count: { select: { members: true, messages: true } },
        members: userId
          ? { where: { userId }, select: { role: true } }
          : false,
        createdBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(rooms);
  } catch (error: any) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/chat/rooms — create a new room (authenticated only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, eventId } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 });
    }

    const room = await prisma.chatRoom.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: type || "general",
        eventId: eventId || null,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
      include: {
        _count: { select: { members: true, messages: true } },
        createdBy: { select: { id: true, name: true, image: true } },
        members: { where: { userId: session.user.id }, select: { role: true } },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    console.error("Error creating chat room:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

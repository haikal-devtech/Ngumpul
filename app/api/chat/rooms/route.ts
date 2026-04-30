import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getChatRooms, createChatRoom } from "@/lib/firestore-admin-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;


    const rooms = await getChatRooms(userId);

    return NextResponse.json(rooms);
  } catch (error: any) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = rateLimit(`chat:rooms:create:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const session = await getServerSession();
    if (!session?.user?.id) {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, eventId, isPrivate, requiresApproval } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 });
    }

    const room = await createChatRoom({
      name: name.trim(),
      description: description?.trim() || null,
      type: type || "general",
      eventId: eventId || null,
      isPrivate: isPrivate ?? false,
      requiresApproval: requiresApproval ?? false,
    }, session.user.id);

    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    console.error("Error creating chat room:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


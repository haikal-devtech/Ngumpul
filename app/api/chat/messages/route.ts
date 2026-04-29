import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { 
  getChatRoom, 
  getChatMessages, 
  createChatMessage, 
  addChatMember 
} from "@/lib/firestore-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const cursor = searchParams.get("cursor") || undefined;
    const limitCount = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    const room = await getChatRoom(roomId);
    
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    if ((room as any).isPrivate) {
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const isMember = (room as any).members.some((m: any) => m.userId === userId);
      if (!isMember) {
        return NextResponse.json({ error: "Forbidden: Not a member of this private room" }, { status: 403 });
      }
    }


    const messages = await getChatMessages(roomId, limitCount, cursor);

    const hasMore = messages.length > limitCount;
    const items = hasMore ? messages.slice(0, limitCount) : messages;

    return NextResponse.json({
      messages: items.reverse(),
      nextCursor: hasMore ? items[0]?.id : null,
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = rateLimit(`chat:messages:${ip}`, { limit: 30, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roomId, content, type = "text", mediaUrl = null } = body;

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    if (type === "text" && (!content || content.trim().length === 0)) {
       return NextResponse.json({ error: "content is required for text messages" }, { status: 400 });
    }

    const room = await getChatRoom(roomId);
    
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    const existingMember = (room as any).members.find((m: any) => m.userId === session.user.id);
    if ((room as any).isPrivate && !existingMember) {
      return NextResponse.json({ error: "Forbidden: Cannot send messages to a private room without joining" }, { status: 403 });
    }

    if (!existingMember && !(room as any).isPrivate) {
      await addChatMember(roomId, session.user.id);
    }


    const message = await createChatMessage({
      roomId,
      senderId: session.user.id,
      content: content?.trim() || "",
      type,
      mediaUrl,
      isDeleted: false,
      sender: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


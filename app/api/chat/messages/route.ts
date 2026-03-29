import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET /api/chat/messages?roomId=xxx&cursor=xxx&limit=50
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    // Verify room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { members: true },
    });
    
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    // Strict access control: if room is private, user must be a member
    if (room.isPrivate) {
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const isMember = room.members.some((m) => m.userId === userId);
      if (!isMember) {
        return NextResponse.json({ error: "Forbidden: Not a member of this private room" }, { status: 403 });
      }
    }

    // Get blocked users for authenticated user
    const blockedUserIds: string[] = [];
    if (session?.user?.id) {
      const blocks = await prisma.blockedUser.findMany({
        where: { blockerId: session.user.id },
        select: { blockedId: true },
      });
      blockedUserIds.push(...blocks.map((b) => b.blockedId));
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId,
        isDeleted: false,
        senderId: { notIn: blockedUserIds.length > 0 ? blockedUserIds : undefined },
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;

    return NextResponse.json({
      messages: items.reverse(), // Return in chronological order
      nextCursor: hasMore ? items[0]?.id : null,
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/chat/messages — send a message (authenticated only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roomId, content, type = "text", mediaUrl = null } = body;

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }
    // Allow empty text content if it's media
    if (type === "text" && (!content || content.trim().length === 0)) {
       return NextResponse.json({ error: "content is required for text messages" }, { status: 400 });
    }

    // Verify room exists
    const room = await prisma.chatRoom.findUnique({ 
      where: { id: roomId },
      include: { members: true }
    });
    
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    // Strict access control: if room is private, ensure the existing member has access
    const existingMember = room.members.find((m) => m.userId === session.user.id);
    if (room.isPrivate && !existingMember) {
      return NextResponse.json({ error: "Forbidden: Cannot send messages to a private room without joining" }, { status: 403 });
    }

    // Auto-join public room if not already a member
    if (!existingMember && !room.isPrivate) {
      await prisma.chatMember.create({
        data: { roomId, userId: session.user.id, role: "member" },
      });
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: session.user.id,
        content: content?.trim() || "",
        type,
        mediaUrl,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

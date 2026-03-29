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
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Get blocked users for authenticated user
    const session = await auth();
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
    const { roomId, content } = body;

    if (!roomId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: "roomId and content are required" }, { status: 400 });
    }

    // Verify room exists
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Auto-join room if not already a member
    const existingMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } },
    });

    if (!existingMember) {
      await prisma.chatMember.create({
        data: { roomId, userId: session.user.id, role: "member" },
      });
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: session.user.id,
        content: content.trim(),
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

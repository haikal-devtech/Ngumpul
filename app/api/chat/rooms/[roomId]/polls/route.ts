import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET /api/chat/rooms/[roomId]/polls — list all polls for a room
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    const polls = await prisma.chatPoll.findMany({
      where: { roomId },
      include: {
        votes: true,
        createdBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(polls);
  } catch (error: any) {
    console.error("Error fetching polls:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/chat/rooms/[roomId]/polls — create a new poll
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const body = await req.json();
    const { question, options } = body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: "Invalid poll data. Need question and at least 2 options." }, { status: 400 });
    }

    // Verify membership
    const membership = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden - Must be a room member" }, { status: 403 });
    }

    const poll = await prisma.chatPoll.create({
      data: {
        roomId,
        question: question.trim(),
        options: options.map(opt => opt.trim()).filter(opt => opt.length > 0),
        createdById: session.user.id,
      },
      include: {
        votes: true,
      },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error: any) {
    console.error("Error creating poll:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

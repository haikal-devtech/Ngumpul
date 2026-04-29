import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// POST /api/chat/rooms/[roomId]/polls/[pollId]/vote — submit a vote
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string, pollId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, pollId } = await params;
    const body = await req.json();
    const { optionIndex } = body;

    if (optionIndex === undefined || typeof optionIndex !== "number") {
      return NextResponse.json({ error: "Option index is required" }, { status: 400 });
    }

    // Verify membership
    const membership = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden - Must be a room member" }, { status: 403 });
    }

    // Verify poll exists
    const poll = await prisma.chatPoll.findUnique({
      where: { id: pollId },
    });

    if (!poll || poll.roomId !== roomId) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 });
    }

    // Upsert vote
    const vote = await prisma.chatPollVote.upsert({
      where: {
        pollId_userId: { pollId, userId: session.user.id },
      },
      update: {
        optionIndex,
      },
      create: {
        pollId,
        userId: session.user.id,
        optionIndex,
      },
    });

    return NextResponse.json(vote);
  } catch (error: any) {
    console.error("Error submitting vote:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

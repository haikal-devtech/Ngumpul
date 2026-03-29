import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isFinalized } = await req.json();
    const poll = await prisma.chatPoll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPoll = await prisma.chatPoll.update({
      where: { id: pollId },
      data: { isFinalized },
    });

    return NextResponse.json(updatedPoll);
  } catch (error) {
    console.error("Failed to update poll:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

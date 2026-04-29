import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { getChatPollById, updateChatPollStatus } from "@/lib/firestore-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isFinalized } = await req.json();
    const poll = await getChatPollById(pollId);

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if ((poll as any).createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await updateChatPollStatus((poll as any).roomId, pollId, isFinalized);

    return NextResponse.json({ success: true, isFinalized });
  } catch (error) {
    console.error("Failed to update poll:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { 
  getChatMember, 
  getChatPoll, 
  voteChatPoll 
} from "@/lib/firestore-utils";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string, pollId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, pollId } = await params;
    const body = await req.json();
    const { optionIndex } = body;

    if (optionIndex === undefined || typeof optionIndex !== "number") {
      return NextResponse.json({ error: "Option index is required" }, { status: 400 });
    }

    const membership = await getChatMember(roomId, session.user.id);

    if (!membership) {
      return NextResponse.json({ error: "Forbidden - Must be a room member" }, { status: 403 });
    }

    const poll = await getChatPoll(roomId, pollId);

    if (!poll || (poll as any).roomId !== roomId) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (optionIndex < 0 || optionIndex >= (poll as any).options.length) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 });
    }

    await voteChatPoll(roomId, pollId, session.user.id, optionIndex);

    return NextResponse.json({ success: true, optionIndex });
  } catch (error: any) {
    console.error("Error submitting vote:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


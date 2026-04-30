import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { 
  getChatRoom, 
  getChatMember, 
  getChatPolls, 
  createChatPoll 
} from "@/lib/firestore-admin-utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const room = await getChatRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if ((room as any).isPrivate) {
      const membership = (await getChatMember(roomId, session.user.id)) as any;
      if (!membership) {
        return NextResponse.json({ error: "Forbidden: Not a member of this room" }, { status: 403 });
      }
    }

    const polls = await getChatPolls(roomId);

    return NextResponse.json(polls);
  } catch (error: any) {
    console.error("Error fetching polls:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const body = await req.json();
    const { question, options } = body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Invalid poll data. Need question and at least 2 options." },
        { status: 400 }
      );
    }

    const membership = (await getChatMember(roomId, session.user.id)) as any;

    if (!membership) {
      return NextResponse.json({ error: "Forbidden - Must be a room member" }, { status: 403 });
    }

    const poll = await createChatPoll(roomId, {
      question: question.trim(),
      options: options.map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0),
      createdById: session.user.id,
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error: any) {
    console.error("Error creating poll:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


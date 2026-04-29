import { NextRequest, NextResponse } from "next/server";
import { getChatMember, removeChatMember } from "@/lib/firestore-utils";
import { getServerSession } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

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
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
    }

    const currentMember = await getChatMember(roomId, session.user.id);

    if (!currentMember || (currentMember as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "You cannot kick yourself" }, { status: 400 });
    }

    const targetMember = await getChatMember(roomId, targetUserId);

    if (!targetMember) {
      return NextResponse.json({ error: "Target user is not a member of this room" }, { status: 404 });
    }

    if ((targetMember as any).role === "admin") {
      return NextResponse.json({ error: "Cannot kick another admin" }, { status: 403 });
    }

    await removeChatMember(roomId, targetUserId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error kicking member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


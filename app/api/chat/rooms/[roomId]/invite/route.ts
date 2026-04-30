import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { 
  getChatRoom, 
  getChatMember, 
  generateChatInviteCode 
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

    const member = await getChatMember(roomId, session.user.id);

    if (!member && (room as any).createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!(room as any).inviteCode) {
      const newCode = await generateChatInviteCode(roomId);
      return NextResponse.json({ inviteCode: newCode });
    }

    return NextResponse.json({ inviteCode: (room as any).inviteCode });
  } catch (error: any) {
    console.error("Error with invite code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


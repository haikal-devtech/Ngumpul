import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { 
  getChatRoomByInviteCode, 
  getChatMember, 
  getChatJoinRequest, 
  createChatJoinRequest, 
  addChatMember 
} from "@/lib/firestore-utils";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    const room = await getChatRoomByInviteCode(resolvedParams.code);

    if (!room) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    const existingMember = await getChatMember(room.id, session.user.id);

    if (!existingMember) {
      if ((room as any).requiresApproval) {
        const existingRequest = await getChatJoinRequest(room.id, session.user.id);

        if (!existingRequest) {
          await createChatJoinRequest(room.id, session.user.id);
        }
        return NextResponse.json({ roomId: room.id, requiresApproval: true, status: "pending" });
      } else {
        await addChatMember(room.id, session.user.id);
      }
    }

    return NextResponse.json({ roomId: room.id });
  } catch (error: any) {
    console.error("Error joining via invite:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


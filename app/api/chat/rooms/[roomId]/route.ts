import { NextRequest, NextResponse } from "next/server";
import { getChatRoom, deleteChatRoom } from "@/lib/firestore-utils";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    const room = await getChatRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if ((room as any).createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden - Room creators only" }, { status: 403 });
    }


    await deleteChatRoom(roomId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting room:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


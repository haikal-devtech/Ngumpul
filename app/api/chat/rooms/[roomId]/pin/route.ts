import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { updateChatMemberPin } from "@/lib/firestore-admin-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { isPinned } = await req.json();

    await updateChatMemberPin(roomId, userId, isPinned);

    return NextResponse.json({ success: true, isPinned });
  } catch (error) {
    console.error("Failed to pin room:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


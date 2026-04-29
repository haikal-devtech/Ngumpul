import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { v4 as uuidv4 } from "uuid";


export const dynamic = "force-dynamic";

// GET /api/chat/rooms/[roomId]/invite — get or generate an invite code
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    // Verify room exists and user is a member/creator
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is a member
    const member = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } },
    });

    if (!member && room.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate code if it doesn't exist
    if (!room.inviteCode) {
      const newCode = uuidv4().substring(0, 10);

      const updated = await prisma.chatRoom.update({
        where: { id: roomId },
        data: { inviteCode: newCode },
      });
      return NextResponse.json({ inviteCode: updated.inviteCode });
    }

    return NextResponse.json({ inviteCode: room.inviteCode });
  } catch (error: any) {
    console.error("Error with invite code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

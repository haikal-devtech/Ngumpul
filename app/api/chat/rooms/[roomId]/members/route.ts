import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET /api/chat/rooms/[roomId]/members — List all members of a room
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

    // Check if user is a member or if room is public
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const members = await prisma.chatMember.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, name: true, image: true, email: true } }
      },
      orderBy: { joinedAt: "asc" }
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("Error fetching room members:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

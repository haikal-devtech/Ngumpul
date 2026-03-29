import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// POST /api/chat/invite/[code] — Join a room via invite code
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    // Find room by invite code
    const room = await prisma.chatRoom.findUnique({
      where: { inviteCode: resolvedParams.code },
    });

    if (!room) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: session.user.id } },
    });

    if (!existingMember) {
      if (room.requiresApproval) {
        // Check if there is already a pending request
        const existingRequest = await prisma.chatJoinRequest.findUnique({
          where: { roomId_userId: { roomId: room.id, userId: session.user.id } },
        });

        if (!existingRequest) {
          await prisma.chatJoinRequest.create({
            data: {
              roomId: room.id,
              userId: session.user.id,
              status: "pending",
            },
          });
        }
        return NextResponse.json({ roomId: room.id, requiresApproval: true, status: "pending" });
      } else {
        // Add user to room directly
        await prisma.chatMember.create({
          data: {
            roomId: room.id,
            userId: session.user.id,
            role: "member",
          },
        });
      }
    }

    return NextResponse.json({ roomId: room.id });
  } catch (error: any) {
    console.error("Error joining via invite:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

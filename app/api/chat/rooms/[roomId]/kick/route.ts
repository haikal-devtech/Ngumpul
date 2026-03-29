import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// POST /api/chat/rooms/[roomId]/kick — admin-only kick a member
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
    }

    // Check if the current user is an admin
    const currentMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } },
    });

    if (!currentMember || currentMember.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
    }

    // Check if target user is trying to kick themselves
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "You cannot kick yourself" }, { status: 400 });
    }

    // Check if target user is also an admin
    const targetMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: targetUserId } },
    });

    if (!targetMember) {
      return NextResponse.json({ error: "Target user is not a member of this room" }, { status: 404 });
    }

    if (targetMember.role === "admin") {
      return NextResponse.json({ error: "Cannot kick another admin" }, { status: 403 });
    }

    // Remove the target member
    await prisma.chatMember.delete({
      where: { roomId_userId: { roomId, userId: targetUserId } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error kicking member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

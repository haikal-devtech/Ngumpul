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

// PATCH /api/chat/rooms/[roomId]/members — Update a member's role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const { userId: targetUserId, role } = await req.json();

    if (!targetUserId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if current user is an admin or moderator
    const currentUserMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } }
    });

    if (!currentUserMember || (currentUserMember.role !== "admin" && currentUserMember.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const updated = await prisma.chatMember.update({
      where: { roomId_userId: { roomId, userId: targetUserId } },
      data: { role }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating member role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/chat/rooms/[roomId]/members — Kick a member
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
    const { userId: targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Check if current user is an admin or moderator
    const currentUserMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } }
    });

    if (!currentUserMember || (currentUserMember.role !== "admin" && currentUserMember.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Don't allow kicking yourself (you should "leave" instead)
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
    }

    await prisma.chatMember.delete({
      where: { roomId_userId: { roomId, userId: targetUserId } }
    });

    return NextResponse.json({ success: true, message: "Member kicked" });
  } catch (error: any) {
    console.error("Error kicking member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

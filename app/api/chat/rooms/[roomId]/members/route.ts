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

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { id: true, isPrivate: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // ── Membership check: requester must be in the room ───────────────────
    const requesterMembership = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } },
    });

    if (!requesterMembership) {
      return NextResponse.json({ error: "Forbidden: Not a member of this room" }, { status: 403 });
    }

    const members = await prisma.chatMember.findMany({
      where: { roomId },
      include: {
        // ── Do NOT expose email in the member list ────────────────────────
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { joinedAt: "asc" },
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

    // Validate that role is one of the allowed values
    const VALID_ROLES = ["member", "moderator", "admin"];
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if current user is an admin or moderator
    const currentUserMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } },
    });

    if (!currentUserMember || (currentUserMember.role !== "admin" && currentUserMember.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // ── Privilege escalation prevention ───────────────────────────────────
    // Only admins can assign or remove the "admin" role.
    // Moderators can only assign "member" or "moderator".
    if (role === "admin" && currentUserMember.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can grant the admin role" },
        { status: 403 }
      );
    }

    // Moderators cannot demote other admins
    const targetMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: targetUserId } },
    });

    if (!targetMember) {
      return NextResponse.json({ error: "Target user is not a member of this room" }, { status: 404 });
    }

    if (targetMember.role === "admin" && currentUserMember.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can modify another admin's role" },
        { status: 403 }
      );
    }

    const updated = await prisma.chatMember.update({
      where: { roomId_userId: { roomId, userId: targetUserId } },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating member role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/chat/rooms/[roomId]/members — Leave or kick a member
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

    const currentUserMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } },
    });

    if (!currentUserMember || (currentUserMember.role !== "admin" && currentUserMember.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
    }

    await prisma.chatMember.delete({
      where: { roomId_userId: { roomId, userId: targetUserId } },
    });

    return NextResponse.json({ success: true, message: "Member kicked" });
  } catch (error: any) {
    console.error("Error kicking member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

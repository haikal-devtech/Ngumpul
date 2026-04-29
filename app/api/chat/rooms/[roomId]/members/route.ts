import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { 
  getChatRoom, 
  getChatMember, 
  updateChatMemberRole, 
  removeChatMember 
} from "@/lib/firestore-utils";

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

    const requesterMembership = (room as any).members.find((m: any) => m.userId === session.user.id);

    if (!requesterMembership) {
      return NextResponse.json({ error: "Forbidden: Not a member of this room" }, { status: 403 });
    }

    return NextResponse.json((room as any).members);
  } catch (error: any) {
    console.error("Error fetching room members:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const { userId: targetUserId, role } = await req.json();

    if (!targetUserId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const VALID_ROLES = ["member", "moderator", "admin"];
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const currentUserMember = (await getChatMember(roomId, session.user.id)) as any;

    if (!currentUserMember || (currentUserMember.role !== "admin" && currentUserMember.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    if (role === "admin" && currentUserMember.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can grant the admin role" }, { status: 403 });
    }

    const targetMember = (await getChatMember(roomId, targetUserId)) as any;

    if (!targetMember) {
      return NextResponse.json({ error: "Target user is not a member of this room" }, { status: 404 });
    }

    if (targetMember.role === "admin" && currentUserMember.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can modify another admin's role" }, { status: 403 });
    }

    await updateChatMemberRole(roomId, targetUserId, role);

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("Error updating member role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const { userId: targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const currentUserMember = (await getChatMember(roomId, session.user.id)) as any;

    if (!currentUserMember || (currentUserMember.role !== "admin" && currentUserMember.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
    }

    await removeChatMember(roomId, targetUserId);

    return NextResponse.json({ success: true, message: "Member kicked" });
  } catch (error: any) {
    console.error("Error kicking member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


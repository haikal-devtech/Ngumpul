import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET /api/chat/rooms/[roomId]/requests — List pending requests (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    // Check if user is an admin of this room
    const adminCheck = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId: resolvedParams.roomId, userId: session.user.id } },
    });

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
    }

    const requests = await prisma.chatJoinRequest.findMany({
      where: { roomId: resolvedParams.roomId, status: "pending" },
      include: {
        user: { select: { id: true, name: true, image: true, email: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/chat/rooms/[roomId]/requests — Approve or reject a request
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    // Check admin
    const adminCheck = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId: resolvedParams.roomId, userId: session.user.id } },
    });

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action } = body; // action: "approve" | "reject"

    if (!requestId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const joinRequest = await prisma.chatJoinRequest.findUnique({
      where: { id: requestId }
    });

    if (!joinRequest || joinRequest.roomId !== resolvedParams.roomId) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Add member
      await prisma.chatMember.create({
        data: {
          roomId: joinRequest.roomId,
          userId: joinRequest.userId,
          role: "member"
        }
      });
      // Update request status
      await prisma.chatJoinRequest.update({
        where: { id: requestId },
        data: { status: "approved" }
      });
    } else if (action === "reject") {
      await prisma.chatJoinRequest.update({
        where: { id: requestId },
        data: { status: "rejected" }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

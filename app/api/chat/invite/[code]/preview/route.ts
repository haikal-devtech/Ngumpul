import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/chat/invite/[code]/preview — Get basic room details by invite code
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const resolvedParams = await params;

    // Find room by invite code
    const room = await prisma.chatRoom.findUnique({
      where: { inviteCode: resolvedParams.code },
      select: {
        id: true,
        name: true,
        description: true,
        isPrivate: true,
        requiresApproval: true,
        _count: { select: { members: true } }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error: any) {
    console.error("Error fetching room preview:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

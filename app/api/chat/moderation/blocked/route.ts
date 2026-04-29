import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET /api/chat/moderation/blocked — list all users blocked by the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blocks = await prisma.blockedUser.findMany({
      where: { blockerId: session.user.id },
      include: {
        blocked: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const blockedUsers = blocks.map((b) => ({
      id: b.blocked.id,
      name: b.blocked.name,
      image: b.blocked.image,
      blockedAt: b.createdAt,
    }));

    return NextResponse.json(blockedUsers);
  } catch (error: any) {
    console.error("Error fetching blocked users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

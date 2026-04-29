import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { isPinned } = await req.json();

    const member = await prisma.chatMember.update({
      where: {
        roomId_userId: {
          roomId: roomId,
          userId: userId
        }
      },
      data: { isPinned }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to pin room:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

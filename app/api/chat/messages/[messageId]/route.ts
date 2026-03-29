import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { content: content.trim() },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Failed to edit message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId !== userId) {
      // Check if user is admin of the room
      const member = await prisma.chatMember.findUnique({
        where: {
          roomId_userId: {
            roomId: message.roomId,
            userId: userId
          }
        }
      });
      
      if (member?.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true, content: "Pesan ini telah dihapus" },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { 
  getChatMessageById, 
  updateChatMessage, 
  getChatMember 
} from "@/lib/firestore-admin-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const message = await getChatMessageById(messageId);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if ((message as any).senderId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await updateChatMessage((message as any).roomId, messageId, { 
      content: content.trim(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to edit message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const message = await getChatMessageById(messageId);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const roomId = (message as any).roomId;

    if ((message as any).senderId !== userId) {
      const member = await getChatMember(roomId, userId);
      
      if (!member || (member as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      const createdAt = (message as any).createdAt?.toDate() || new Date();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (createdAt < fiveMinutesAgo) {
        return NextResponse.json({ error: "Message cannot be deleted after 5 minutes" }, { status: 400 });
      }
    }

    await updateChatMessage(roomId, messageId, { 
      isDeleted: true, 
      content: "Pesan ini telah dihapus" 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


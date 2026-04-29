import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// POST /api/chat/moderation — report a message or block a user
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 moderation actions / 60s per IP
    const ip = getClientIp(req);
    const { success } = rateLimit(`chat:moderation:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, messageId, targetUserId, reason } = body;

    if (action === "report") {
      if (!messageId || !reason) {
        return NextResponse.json({ error: "messageId and reason are required" }, { status: 400 });
      }

      // Verify message exists
      const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
      if (!message) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
      }

      // Prevent self-report
      if (message.senderId === session.user.id) {
        return NextResponse.json({ error: "Cannot report your own message" }, { status: 400 });
      }

      // Check for duplicate report
      const existing = await prisma.reportedMessage.findFirst({
        where: { messageId, reporterId: session.user.id },
      });
      if (existing) {
        return NextResponse.json({ error: "Already reported" }, { status: 409 });
      }

      const report = await prisma.reportedMessage.create({
        data: {
          messageId,
          reporterId: session.user.id,
          reason: reason.trim(),
        },
      });

      return NextResponse.json(report, { status: 201 });
    }

    if (action === "block") {
      if (!targetUserId) {
        return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
      }

      // Prevent self-block
      if (targetUserId === session.user.id) {
        return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
      }

      // Check for existing block
      const existing = await prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: session.user.id,
            blockedId: targetUserId,
          },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Already blocked" }, { status: 409 });
      }

      const block = await prisma.blockedUser.create({
        data: {
          blockerId: session.user.id,
          blockedId: targetUserId,
        },
      });

      return NextResponse.json(block, { status: 201 });
    }

    if (action === "unblock") {
      if (!targetUserId) {
        return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
      }

      await prisma.blockedUser.deleteMany({
        where: {
          blockerId: session.user.id,
          blockedId: targetUserId,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in moderation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

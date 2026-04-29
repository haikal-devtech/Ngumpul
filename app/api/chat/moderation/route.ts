import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { 
  addReport, 
  getReport, 
  addBlock, 
  getBlock, 
  removeBlock
} from "@/lib/firestore-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = rateLimit(`chat:moderation:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, messageId, targetUserId, reason } = body;

    if (action === "report") {
      if (!messageId || !reason) {
        return NextResponse.json({ error: "messageId and reason are required" }, { status: 400 });
      }

      const existing = await getReport(messageId, session.user.id);
      if (existing) {
        return NextResponse.json({ error: "Already reported" }, { status: 409 });
      }

      const report = await addReport({
        messageId,
        reporterId: session.user.id,
        reason: reason.trim(),
      });

      return NextResponse.json(report, { status: 201 });
    }

    if (action === "block") {
      if (!targetUserId) {
        return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
      }

      if (targetUserId === session.user.id) {
        return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
      }

      const existing = await getBlock(session.user.id, targetUserId);
      if (existing) {
        return NextResponse.json({ error: "Already blocked" }, { status: 409 });
      }

      await addBlock(session.user.id, targetUserId);

      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (action === "unblock") {
      if (!targetUserId) {
        return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
      }

      await removeBlock(session.user.id, targetUserId);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in moderation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


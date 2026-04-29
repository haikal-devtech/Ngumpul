import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { 
  getChatMember, 
  getChatJoinRequests, 
  updateChatJoinRequestStatus, 
  addChatMember 
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

    const adminCheck = (await getChatMember(roomId, session.user.id)) as any;

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
    }

    const requests = await getChatJoinRequests(roomId);

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    const adminCheck = (await getChatMember(roomId, session.user.id)) as any;

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { userId: targetUserId, action } = body; // Doc ID in joinRequests is the userId

    if (!targetUserId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (action === "approve") {
      await addChatMember(roomId, targetUserId);
      await updateChatJoinRequestStatus(roomId, targetUserId, "approved");
    } else if (action === "reject") {
      await updateChatJoinRequestStatus(roomId, targetUserId, "rejected");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


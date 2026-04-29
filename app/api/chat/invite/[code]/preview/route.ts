import { NextRequest, NextResponse } from "next/server";
import { getChatRoomByInviteCode } from "@/lib/firestore-utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const room = await getChatRoomByInviteCode(code);

    if (!room) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error: any) {
    console.error("Error fetching room preview:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


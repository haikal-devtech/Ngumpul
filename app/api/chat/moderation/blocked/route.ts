import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";
import { getBlockedUsers } from "@/lib/firestore-admin-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blockedUsers = await getBlockedUsers(session.user.id);

    return NextResponse.json(blockedUsers);
  } catch (error: any) {
    console.error("Error fetching blocked users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


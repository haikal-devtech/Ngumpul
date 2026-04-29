import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    return {
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
        image: decodedToken.picture || null,
      },
    };
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return null;
  }
}

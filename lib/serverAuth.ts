import { cookies } from "next/headers";
import { getAdminAuth } from "./firebaseAdmin";

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      console.log("DEBUG: No __session cookie found in request");
      return null;
    }

    const auth = getAdminAuth();
    if (!auth) {
      console.error("DEBUG: Firebase Admin Auth could not be initialized.");
      return null;
    }

    // IMPORTANT: Use verifySessionCookie for the __session cookie, NOT verifyIdToken
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    
    return {
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
        image: decodedToken.picture || null,
      },
    };
  } catch (error) {
    console.error("DEBUG: Error verifying session cookie:", error);
    return null;
  }
}

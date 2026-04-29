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

    // Since the client sets ID Token in __session cookie directly
    const decodedToken = await auth.verifyIdToken(sessionCookie);
    
    return {
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
        image: decodedToken.picture || null,
      },
    };
  } catch (error) {
    console.error("DEBUG: Error verifying ID Token from cookie:", error);
    return null;
  }
}

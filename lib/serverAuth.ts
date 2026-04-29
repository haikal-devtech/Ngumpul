import { cookies } from "next/headers";
import { getAdminAuth } from "./firebaseAdmin";

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      console.log("DEBUG: [getServerSession] No __session cookie found.");
      return null;
    }

    console.log("DEBUG: [getServerSession] Found cookie. Length:", sessionCookie.length);

    const auth = getAdminAuth();
    if (!auth) {
      console.error("DEBUG: [getServerSession] Firebase Admin Auth NOT INITIALIZED.");
      return null;
    }

    try {
      // Verify the ID Token
      const decodedToken = await auth.verifyIdToken(sessionCookie);
      console.log("DEBUG: [getServerSession] Verification SUCCESS. User:", decodedToken.uid);
      
      return {
        user: {
          id: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
          image: decodedToken.picture || null,
        },
      };
    } catch (verifyError: any) {
      console.error("DEBUG: [getServerSession] verifyIdToken FAILED:", verifyError.message);
      return null;
    }
  } catch (error: any) {
    console.error("DEBUG: [getServerSession] UNEXPECTED ERROR:", error.message);
    return null;
  }
}

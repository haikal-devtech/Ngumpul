import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      console.log("No __session cookie found in request");
      return null;
    }

    if (!adminAuth) {
      console.error("Firebase Admin Auth not initialized! Check FIREBASE_SERVICE_ACCOUNT_KEY");
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


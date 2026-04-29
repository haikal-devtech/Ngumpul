import { adminAuth } from "./lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function auth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("__session")?.value;

  if (!sessionToken) return null;

  try {
    const decodedToken = await adminAuth.verifyIdToken(sessionToken);
    return {
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        image: decodedToken.picture,
      },
    };
  } catch (error) {
    console.error("Firebase auth error:", error);
    return null;
  }
}

export const handlers = {}; // Placeholder for compatibility
export const signIn = () => {}; // Placeholder
export const signOut = () => {}; // Placeholder

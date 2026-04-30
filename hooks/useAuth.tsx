"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { 
  onIdTokenChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // force refresh token if possible to ensure we have the latest
        const token = await user.getIdToken();
        console.log("Firebase Auth: Token received, setting __session cookie");
        const isSecure = window.location.protocol === "https:";
        document.cookie = `__session=${token}; path=/; samesite=lax${isSecure ? '; secure' : ''}`;
        console.log("Firebase Auth: Cookie set. Current cookies:", document.cookie.substring(0, 50) + "...");
      } else {
        console.log("Firebase Auth: No user, clearing __session cookie");
        const isSecure = window.location.protocol === "https:";
        document.cookie = `__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${isSecure ? '; secure' : ''}`;
      }

      setLoading(false);
    });


    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in with Google", error);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

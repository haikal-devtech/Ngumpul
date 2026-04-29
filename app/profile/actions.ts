"use server";
import { auth } from "@/auth";
import { updateUserProfile, getUserProfile } from "@/lib/firestore-utils";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; bio: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not logged in" };
  }
  
  try {
    await updateUserProfile(session.user.id, {
      name: data.name,
      bio: data.bio
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    
    return { success: true, user: { name: data.name, bio: data.bio } };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  
  const user = await getUserProfile(session.user.id);
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    image: user.image,
    bio: user.bio,
    email: user.email
  };
}


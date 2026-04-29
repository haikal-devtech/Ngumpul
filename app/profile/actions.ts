"use server";
import { getServerSession } from "@/lib/serverAuth";
import { updateUserProfile, getUserProfile } from "@/lib/firestore-utils";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; bio: string }) {
  const session = await getServerSession();
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
  const session = await getServerSession();
  if (!session?.user?.id) {
    return null;
  }
  
  const user = await getUserProfile(session.user.id);
  if (!user) return null;
  
  const u = user as any;
  return {
    id: u.id,
    name: u.name,
    image: u.image,
    bio: u.bio,
    email: u.email
  };
}




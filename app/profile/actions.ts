"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; bio: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not logged in" };
  }
  
  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        bio: data.bio
      }
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    
    return { success: true, user: { name: updated.name, bio: updated.bio } };
  } catch (error) {
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, image: true, bio: true, email: true }
  });
  
  return user;
}

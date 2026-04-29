import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadChatMedia = async (file: File, roomId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${roomId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, `chat-media/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const publicUrl = await getDownloadURL(storageRef);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error('Exception during upload:', error);
    return { url: null, error: error.message };
  }
};

// Placeholder for Supabase compatibility if needed, but we should eventually remove this file
export const supabase = {
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: {}, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } })
    })
  },
  channel: () => ({
    on: () => ({
      subscribe: () => ({})
    }),
    subscribe: () => ({}),
    unsubscribe: () => ({}),
    send: () => ({})
  })
} as any;

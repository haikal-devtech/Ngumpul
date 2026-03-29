import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const uploadChatMedia = async (file: File, roomId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${roomId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    // Upload standard to chat-media bucket
    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('File upload error:', error.message);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error('Exception during upload:', error);
    return { url: null, error: error.message };
  }
};

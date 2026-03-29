"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { useAppContext } from "@/components/AppContext";

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useAppContext();
  
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const resolvedParams = React.use(params);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // Redirect to login, then come back to this invite
      sessionStorage.setItem("ngumpul_redirect_after_login", `/chat/invite/${resolvedParams.code}`);
      router.push("/login");
      return;
    }

    const joinRoom = async () => {
      setJoining(true);
      try {
        const res = await fetch(`/api/chat/invite/${resolvedParams.code}`, {
          method: "POST",
        });
        
        if (res.ok) {
          // Success, redirect to chat
          router.replace("/chat");
        } else {
          const data = await res.json();
          setError(data.error || "Failed to join room");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setJoining(false);
      }
    };

    joinRoom();
  }, [session, status, resolvedParams.code, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex flex-col items-center justify-center p-4 pt-16">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            {language === 'id' ? 'Tautan Tidak Valid' : 'Invalid Invite Link'}
          </h2>
          <p className="text-sm text-zinc-500 mb-8">
            {error}
          </p>
          <button 
            onClick={() => router.push("/chat")}
            className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-colors"
          >
            {language === 'id' ? 'Kembali ke Obrolan' : 'Back to Chat'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex flex-col items-center justify-center p-4 pt-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-8 text-indigo-600 dark:text-indigo-400">
          <Shield size={40} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          {language === 'id' ? 'Bergabung ke Ruang Obrolan...' : 'Joining Chat Room...'}
        </h2>
        <div className="flex justify-center items-center text-zinc-400 gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm font-medium">
            {language === 'id' ? 'Memverifikasi undangan' : 'Verifying invite'}
          </span>
        </div>
      </div>
    </div>
  );
}

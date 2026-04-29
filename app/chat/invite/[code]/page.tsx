"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, AlertCircle, Hash, Users, Lock, UserPlus } from "lucide-react";
import { useAppContext } from "@/components/AppContext";

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useAppContext();
  
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [roomPreview, setRoomPreview] = useState<any>(null);
  const [requestSent, setRequestSent] = useState(false);
  const resolvedParams = React.use(params);

  useEffect(() => {
    // Fetch room preview
    const fetchPreview = async () => {
      try {
        const res = await fetch(`/api/chat/invite/${resolvedParams.code}/preview`);
        if (res.ok) {
          const data = await res.json();
          setRoomPreview(data);
        } else {
          setError(language === 'id' ? 'Tautan undangan tidak valid atau grup tidak ditemukan' : "Invalid invite link or group not found");
        }
      } catch {
        setError(language === 'id' ? 'Gagal memuat detail undangan' : "Failed to load invite details");
      }
    };
    fetchPreview();
  }, [resolvedParams.code, language]);

  const handleJoin = async () => {
    if (status === "loading") return;

    if (!session) {
      sessionStorage.setItem("ngumpul_redirect_after_login", `/chat/invite/${resolvedParams.code}`);
      router.push("/login");
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`/api/chat/invite/${resolvedParams.code}`, {
        method: "POST",
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.status === "pending") {
          setRequestSent(true);
        } else {
          // Success, redirect to chat
          router.replace("/chat");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Failed to join room");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setJoining(false);
    }
  };

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

  if (!roomPreview) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex flex-col items-center justify-center p-4 pt-16">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex flex-col items-center justify-center p-4 pt-16">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center relative overflow-hidden">
        {roomPreview.isPrivate && (
          <div className="absolute top-4 right-4 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-200 dark:border-amber-800/50">
            <Lock size={12} />
            {language === 'id' ? 'Grup Privat' : 'Private Group'}
          </div>
        )}

        <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mt-4 mb-6 text-indigo-600 dark:text-indigo-400">
          {roomPreview.isPrivate ? <Lock size={36} /> : <Hash size={40} />}
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          {roomPreview.name}
        </h2>
        
        {roomPreview.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 px-4">
            {roomPreview.description}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 font-medium mb-8 bg-zinc-50 dark:bg-zinc-800/50 w-fit mx-auto px-4 py-2 rounded-full">
          <Users size={16} />
          {roomPreview._count?.members || 0} {language === 'id' ? 'Anggota' : 'Members'}
        </div>

        {requestSent ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 mb-2 text-left">
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
              <Shield size={18} />
              {language === 'id' ? 'Permintaan Terkirim!' : 'Request Sent!'}
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500/80 leading-relaxed">
              {language === 'id' 
                ? 'Permintaan Anda untuk bergabung telah dikirim ke admin. Anda akan otomatis ditambahkan setelah disetujui.' 
                : 'Your request to join has been sent to the admins. You will be automatically added to the group once approved.'}
            </p>
            <button 
              onClick={() => router.push("/chat")}
              className="mt-6 w-full py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl border border-emerald-100 dark:border-zinc-700 transition-colors shadow-sm"
            >
              {language === 'id' ? 'Kembali ke Obrolan' : 'Back to Chat'}
            </button>
          </div>
        ) : (
          <button 
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mb-4 disabled:opacity-70 shadow-lg shadow-indigo-600/20"
          >
            {joining ? (
              <Loader2 size={18} className="animate-spin" />
            ) : roomPreview.requiresApproval ? (
              <Shield size={18} />
            ) : (
              <UserPlus size={18} />
            )}
            {joining 
              ? (language === 'id' ? 'Memproses...' : 'Processing...')
              : roomPreview.requiresApproval
                ? (language === 'id' ? 'Minta Bergabung' : 'Request to Join')
                : (language === 'id' ? 'Bergabung ke Grup' : 'Join Group')
            }
          </button>
        )}

        {!requestSent && (
          <button 
            onClick={() => router.push("/chat")}
            className="text-sm font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            {language === 'id' ? 'Batal' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
}

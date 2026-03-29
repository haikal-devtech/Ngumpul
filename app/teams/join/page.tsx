"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/components/AppContext";
import { Team } from "@/lib/types";

function decodeTeamFromHash(hash: string): { id: string; name: string; desc: string; code: string } | null {
  try {
    let b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const decoded = decodeURIComponent(escape(atob(b64)));
    const data = JSON.parse(decoded);
    if (data.id && data.name && data.code) return data;
    return null;
  } catch {
    return null;
  }
}

function JoinTeamContent() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { currentUser, teams, setTeams, setCurrentTeam, language, addToast } = useAppContext();
  const [status, setStatus] = useState<"loading" | "joining" | "success" | "error" | "not-found">("loading");
  const [teamName, setTeamName] = useState("");
  const [processed, setProcessed] = useState(false);

  const t = {
    loading: language === "id" ? "Memuat..." : "Loading...",
    joining: language === "id" ? "Bergabung dengan tim..." : "Joining team...",
    joiningTeam: language === "id" ? "Bergabung dengan" : "Joining",
    success: language === "id" ? "Berhasil bergabung!" : "Successfully joined!",
    alreadyMember: language === "id" ? "Kamu sudah jadi anggota tim ini" : "You're already a member of this team",
    notFound: language === "id" ? "Tautan undangan tidak valid" : "Invalid invite link",
    notFoundDesc: language === "id" ? "Tautan ini mungkin sudah kedaluwarsa atau tidak valid." : "This link may be expired or invalid.",
    redirecting: language === "id" ? "Mengalihkan ke tim..." : "Redirecting to team...",
    pleaseLogin: language === "id" ? "Masuk untuk bergabung dengan tim" : "Sign in to join this team",
    pleaseLoginDesc: language === "id" ? "Kamu perlu masuk untuk bergabung dengan tim ini." : "You need to sign in to join this team.",
    goToLogin: language === "id" ? "Masuk" : "Sign In",
    backToTeams: language === "id" ? "Kembali ke Tim" : "Back to Teams",
  };

  useEffect(() => {
    // Wait for session to finish loading before processing
    if (sessionStatus === "loading") return;

    // Already processed — don't run again
    if (processed) return;

    // Read team data from URL hash
    const hash = window.location.hash.slice(1);
    if (!hash) {
      setProcessed(true);
      setStatus("not-found");
      return;
    }

    const teamData = decodeTeamFromHash(hash);
    if (!teamData) {
      setProcessed(true);
      setStatus("not-found");
      return;
    }

    setTeamName(teamData.name);

    // If user is not logged in, show login prompt (don't mark as processed
    // so they can retry after logging in)
    if (!currentUser) {
      setStatus("error");
      return;
    }

    setProcessed(true);
    setStatus("joining");

    // Check if team already exists locally
    const existingTeam = teams.find(t => t.id === teamData.id || t.inviteCode === teamData.code);

    if (existingTeam) {
      // Already a member?
      const alreadyMember = existingTeam.members.some(m => m.id === currentUser.id);
      if (alreadyMember) {
        setStatus("success");
        setCurrentTeam(existingTeam);
        addToast(t.alreadyMember, "info");
        setTimeout(() => router.push("/teams"), 1500);
        return;
      }

      // Add user to existing team
      const updatedTeam: Team = {
        ...existingTeam,
        members: [
          ...existingTeam.members,
          {
            id: currentUser.id,
            name: currentUser.name,
            role: "member" as const,
            photoUrl: currentUser.photoUrl,
          },
        ],
      };

      setTeams(prev => prev.map(t => (t.id === existingTeam.id ? updatedTeam : t)));
      setCurrentTeam(updatedTeam);
      setStatus("success");
      addToast(language === 'id' ? `Bergabung dengan ${teamData.name}!` : `Joined ${teamData.name}!`, 'success');
      setTimeout(() => router.push("/teams"), 1500);
      return;
    }

    // Team doesn't exist locally — create it from the invite data
    const newTeam: Team = {
      id: teamData.id,
      name: teamData.name,
      description: teamData.desc || undefined,
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          role: "member" as const,
          photoUrl: currentUser.photoUrl,
        },
      ],
      events: [],
      createdAt: new Date().toISOString(),
      inviteCode: teamData.code,
    };

    setTeams(prev => [newTeam, ...prev]);
    setCurrentTeam(newTeam);
    setStatus("success");
    addToast(language === 'id' ? `Bergabung dengan ${teamData.name}!` : `Joined ${teamData.name}!`, 'success');
    setTimeout(() => router.push("/teams"), 1500);
  }, [sessionStatus, currentUser, processed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-100 dark:shadow-black/30 p-8 sm:p-10 text-center">
          {(status === "loading" || status === "joining") && (
            <>
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                {status === "loading" ? t.loading : `${t.joiningTeam} ${teamName}...`}
              </h2>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t.success}</h2>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">{t.redirecting}</p>
            </>
          )}

          {status === "not-found" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t.notFound}</h2>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">{t.notFoundDesc}</p>
              <button
                onClick={() => router.push("/teams")}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                {t.backToTeams}
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t.pleaseLogin}</h2>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">{t.pleaseLoginDesc}</p>
              <button
                onClick={() => {
                  sessionStorage.setItem('ngumpul_redirect_after_login', window.location.pathname + window.location.search + window.location.hash);
                  router.push("/login");
                }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                {t.goToLogin}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <JoinTeamContent />
    </Suspense>
  );
}

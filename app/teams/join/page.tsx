"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/components/AppContext";

function JoinTeamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const { currentUser, teams, setTeams, setCurrentTeam, language } = useAppContext();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "not-found">("loading");

  const t = {
    joining: language === "id" ? "Bergabung dengan tim..." : "Joining team...",
    success: language === "id" ? "Berhasil bergabung!" : "Successfully joined!",
    error: language === "id" ? "Gagal bergabung dengan tim" : "Failed to join team",
    notFound: language === "id" ? "Tim tidak ditemukan" : "Team not found",
    redirecting: language === "id" ? "Mengalihkan..." : "Redirecting...",
    pleaseLogin: language === "id" ? "Silakan masuk untuk bergabung dengan tim" : "Please sign in to join the team",
    goToLogin: language === "id" ? "Masuk" : "Sign In",
    backToTeams: language === "id" ? "Kembali ke Tim" : "Back to Teams",
  };

  useEffect(() => {
    if (!teamId) {
      setStatus("not-found");
      return;
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      setStatus("not-found");
      return;
    }

    if (!currentUser) {
      setStatus("error");
      return;
    }

    const alreadyMember = team.members.some((m) => m.id === currentUser.id);
    if (alreadyMember) {
      setStatus("success");
      setCurrentTeam(team);
      setTimeout(() => router.push("/teams"), 1000);
      return;
    }

    const updatedTeam = {
      ...team,
      members: [
        ...team.members,
        {
          id: currentUser.id,
          name: currentUser.name,
          role: "member" as const,
          photoUrl: currentUser.photoUrl,
        },
      ],
    };

    setTeams((prev) => prev.map((t) => (t.id === teamId ? updatedTeam : t)));
    setCurrentTeam(updatedTeam);
    setStatus("success");
    setTimeout(() => router.push("/teams"), 1000);
  }, [teamId, currentUser, teams, setTeams, setCurrentTeam, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-100 dark:shadow-black/30 p-8 sm:p-10 text-center">
          {status === "loading" && (
            <>
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t.joining}</h2>
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
              <button
                onClick={() => router.push("/teams")}
                className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
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
              <button
                onClick={() => router.push("/login")}
                className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
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

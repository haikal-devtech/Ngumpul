"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppContext } from "@/components/AppContext";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const redirect = sessionStorage.getItem('ngumpul_redirect_after_login');
      if (redirect) {
        sessionStorage.removeItem('ngumpul_redirect_after_login');
        router.replace(redirect);
      } else {
        router.replace("/dashboard");
      }
    }
  }, [session, router]);

  const t = {
    title: language === "id" ? "Selamat datang di Ngumpul" : "Welcome to Ngumpul",
    subtitle:
      language === "id"
        ? "Masuk untuk membuat dan mengelola acara kumpulmu."
        : "Sign in to create and manage your gathering events.",
    google: language === "id" ? "Lanjut dengan Google" : "Continue with Google",
    loading: language === "id" ? "Memuat..." : "Loading...",
    disclaimer:
      language === "id"
        ? "Dengan masuk, kamu menyetujui Syarat Ketentuan dan Kebijakan Privasi kami."
        : "By signing in, you agree to our Terms of Service and Privacy Policy.",
    noAccount:
      language === "id"
        ? "Belum punya akun? Tidak masalah — Google akan membuat satu untukmu."
        : "No account? No problem — Google will create one for you.",
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const redirect = sessionStorage.getItem('ngumpul_redirect_after_login');
    await signIn("google", { callbackUrl: redirect || "/dashboard" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-100 dark:shadow-black/30 p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{t.title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{t.subtitle}</p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,19.001,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
            )}
            {isLoading ? t.loading : t.google}
          </button>

          <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 mt-4">{t.noAccount}</p>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            {[
              language === "id" ? "✓ Buat event & bagikan link instan" : "✓ Create events & share instant link",
              language === "id" ? "✓ Lihat heatmap ketersediaan teman" : "✓ View availability heatmap of friends",
              language === "id" ? "✓ Voting lokasi & konfirmasi waktu" : "✓ Location voting & time confirmation",
            ].map((f, i) => (
              <div key={i} className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <span className="text-emerald-500 font-bold">{f.slice(0, 1)}</span>
                <span>{f.slice(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 mt-4 px-4">{t.disclaimer}</p>
      </div>
    </div>
  );
}

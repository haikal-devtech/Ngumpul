"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useAppContext } from "@/components/AppContext";
import { updateProfile, getProfile } from "./actions";
import { Loader2, Save, LogOut, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { language, setCurrentUser, currentUser } = useAppContext();
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const t = {
    title: language === "id" ? "Profil Saya" : "My Profile",
    subtitle: language === "id" ? "Kelola informasi diri kamu." : "Manage your personal information.",
    nameLabel: language === "id" ? "Nama Panggilan" : "Display Name",
    bioLabel: language === "id" ? "Bio Pendek" : "Short Bio",
    save: language === "id" ? "Simpan Perubahan" : "Save Changes",
    saving: language === "id" ? "Menyimpan..." : "Saving...",
    saved: language === "id" ? "Berhasil Disimpan" : "Saved Successfully",
    logout: language === "id" ? "Keluar" : "Sign Out",
  };

  useEffect(() => {
    async function loadData() {
      const dbUser = await getProfile();
      if (dbUser) {
        setName(dbUser.name || "");
        setBio(dbUser.bio || "");
      } else if (session?.user) {
        setName(session.user.name || "");
      }
      setIsLoading(false);
    }
    if (session) {
      loadData();
    }
  }, [session]);

  const handleLogout = async () => {
    // Clear all persisted user data from localStorage before signing out
    // This prevents stale event/team data from appearing after logout
    const keysToRemove = [
      "ngumpul_myEvents",
      "ngumpul_joinedEvents",
      "ngumpul_teams",
      "ngumpul_currentTeam",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    await signOut({ callbackUrl: "/" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);

    const res = await updateProfile({ name, bio });
    if (res.success) {
      // Update next-auth session token locally
      await update({ name });
      
      // Update global context so Navbar reflects immediately
      if (currentUser) {
        setCurrentUser({ ...currentUser, name, bio });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setIsSaving(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">{t.title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <LogOut size={16} />
          {t.logout}
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <img 
            src={session.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} 
            alt="Profile Picture" 
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg"
          />
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{name || session.user?.name}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{session.user?.email}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-indigo-500" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.nameLabel}</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.bioLabel}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-28 resize-none"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 dark:shadow-none min-w-[160px] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
                {isSaving ? t.saving : saved ? t.saved : t.save}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

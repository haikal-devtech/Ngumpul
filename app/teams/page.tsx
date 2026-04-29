"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, ChevronRight, Crown, Calendar, Clock, Link2, Share2 } from "lucide-react";
import { useAppContext } from "@/components/AppContext";
import { Team } from "@/lib/types";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

// --- Helpers ---
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function generateInviteCode() {
  return Math.random().toString(36).substr(2, 12);
}

function encodeTeamForUrl(team: { id: string; name: string; description?: string; inviteCode: string }) {
  const data = JSON.stringify({
    id: team.id,
    name: team.name,
    desc: team.description || "",
    code: team.inviteCode,
  });
  
  // Use a more robust Unicode-safe base64 approach
  // Then make it URL-safe: + -> -, / -> _, remove =
  let b64: string;
  try {
    // Standard trick for browser base64 with unicode
    const bytes = new TextEncoder().encode(data);
    b64 = btoa(String.fromCharCode(...bytes));
  } catch (e) {
    // Fallback if TextEncoder is unavailable or fails (legacy)
    b64 = btoa(unescape(encodeURIComponent(data)));
  }

  return b64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeTeamFromUrl(hash: string): { id: string; name: string; desc: string; code: string } | null {
  if (!hash) return null;
  try {
    let b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    
    try {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return JSON.parse(decodeURIComponent(escape(atob(b64))));
    }
  } catch {
    return null;
  }
}

// --- CreateTeam Mini-Component ---
function CreateTeamModal({ onCreated, onCancel, language }: { onCreated: (team: Team) => void; onCancel: () => void; language: "en" | "id" }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const { currentUser } = useAppContext();

  const t = {
    title: language === "id" ? "Buat Tim Baru" : "Create New Team",
    teamName: language === "id" ? "Nama Tim" : "Team Name",
    teamNamePlaceholder: language === "id" ? "Contoh: Geng Kuliner Jakarta" : "e.g., Jakarta Foodies",
    teamDesc: language === "id" ? "Deskripsi (Opsional)" : "Description (Optional)",
    teamDescPlaceholder: language === "id" ? "Tentang tim ini..." : "What is this team about...",
    create: language === "id" ? "Buat Tim" : "Create Team",
    cancel: language === "id" ? "Batal" : "Cancel",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const team: Team = {
      id: generateId(),
      name: name.trim(),
      description: desc.trim(),
      members: currentUser ? [{
        id: currentUser.id,
        name: currentUser.name,
        role: "admin" as const,
        photoUrl: currentUser.photoUrl,
      }] : [],
      events: [],
      createdAt: new Date().toISOString(),
      inviteCode: generateInviteCode(),
    };
    onCreated(team);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{t.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.teamName}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.teamNamePlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t.teamDesc}</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t.teamDescPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={onCancel} 
              className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {t.cancel}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
            >
              {t.create}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// --- Main Teams Page ---
export default function TeamsPage() {
  const router = useRouter();
  const { language, currentUser, teams, setTeams, currentTeam, setCurrentTeam, myEvents, joinedEvents, addToast } = useAppContext();
  const [showCreate, setShowCreate] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Keep currentTeam synced with teams array
  useEffect(() => {
    if (currentTeam) {
      const updated = teams.find(t => t.id === currentTeam.id);
      if (updated && updated !== currentTeam) {
        setCurrentTeam(updated);
      }
    }
  }, [teams, currentTeam, setCurrentTeam]);

  const handleCopyInvite = () => {
    if (!currentTeam) return;
    const hash = encodeTeamForUrl(currentTeam);
    const link = `${window.location.origin}/teams/join?code=${hash}`;

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setInviteCopied(true);
      addToast(language === 'id' ? 'Tautan undangan disalin!' : 'Invite link copied!', 'success');
      setTimeout(() => setInviteCopied(false), 2500);
    };
    copyToClipboard();
  };

  const t = {
    title: language === "id" ? "Tim Saya" : "My Teams",
    subtitle: language === "id" ? "Kelola grup dan rencanakan acara bersama" : "Manage groups and plan events together",
    createTeam: language === "id" ? "Buat Tim" : "Create Team",
    noTeams: language === "id" ? "Belum ada tim" : "No teams yet",
    noTeamsDesc: language === "id" ? "Buat tim baru untuk berkolaborasi dengan teman-teman." : "Create a new team to collaborate with your friends.",
    members: language === "id" ? "Anggota" : "Members",
    events: language === "id" ? "Acara" : "Events",
    back: language === "id" ? "← Kembali ke Tim" : "← Back to Teams",
    noTeamEvents: language === "id" ? "Belum ada acara di tim ini" : "No events in this team yet",
    admin: language === "id" ? "Admin" : "Admin",
    member: language === "id" ? "Anggota" : "Member",
    created: language === "id" ? "Dibuat" : "Created",
    inviteMembers: language === "id" ? "Undang Anggota" : "Invite Members",
    linkCopied: language === "id" ? "✓ Tautan Disalin!" : "✓ Link Copied!",
    newEvent: language === "id" ? "+ Acara Baru" : "+ New Event",
    removeMember: language === "id" ? "Hapus" : "Remove",
    leaveTeam: language === "id" ? "Keluar dari Tim" : "Leave Team",
  };

  const handleCreateTeam = (team: Team) => {
    if (team.members.length === 0 && currentUser) {
      team.members = [{
        id: currentUser.id,
        name: currentUser.name,
        role: "admin" as const,
        photoUrl: currentUser.photoUrl,
      }];
    }
    setTeams((prev) => [team, ...prev]);
    setCurrentTeam(team);
    setShowCreate(false);
    addToast(language === 'id' ? 'Tim berhasil dibuat!' : 'Team created successfully!', 'success');
  };

  const handleLeaveTeam = () => {
    if (!currentTeam || !currentUser) return;
    const isAdmin = currentTeam.members.some(m => m.id === currentUser.id && m.role === "admin");
    const updatedTeams = teams.map(t => {
      if (t.id !== currentTeam.id) return t;
      const updatedMembers = t.members.filter(m => m.id !== currentUser.id);
      // If no members left, remove the team
      if (updatedMembers.length === 0) return null;
      return { ...t, members: updatedMembers };
    }).filter(Boolean) as Team[];
    setTeams(updatedTeams);
    setCurrentTeam(null);
    addToast(language === 'id' ? 'Berhasil keluar dari tim' : 'Successfully left the team', 'success');
  };

  // --- Team Workspace View ---
  if (currentTeam) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
        {showCreate && (
          <CreateTeamModal
            onCreated={handleCreateTeam}
            onCancel={() => setShowCreate(false)}
            language={language}
          />
        )}

        <button onClick={() => setCurrentTeam(null)} className="text-sm font-semibold text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 transition-colors mb-8 flex items-center gap-1">
          {t.back}
        </button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start justify-between gap-4 mb-10"
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xl">
                {currentTeam.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{currentTeam.name}</h1>
                {currentTeam.description && (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">{currentTeam.description}</p>
                )}
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-end gap-2"
          >
            <div className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
              {t.created} {format(new Date(currentTeam.createdAt), "d MMM yyyy")}
            </div>
            <div className="flex gap-2">
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={handleCopyInvite}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${inviteCopied ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
               >
                 <Link2 size={12} />
                 {inviteCopied ? t.linkCopied : t.inviteMembers}
               </motion.button>
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                 onClick={() => router.push(`/event/new?teamId=${currentTeam.id}`)}
               >
                 {t.newEvent}
               </motion.button>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-indigo-500" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{t.members}</h3>
              </div>
              <div className="space-y-3">
                {currentTeam.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <img src={member.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{member.name}</div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500">
                        {member.role === "admin" ? t.admin : t.member}
                      </div>
                    </div>
                    {member.role === "admin" && (
                      <Crown size={14} className="text-amber-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 p-5 text-center">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{currentTeam.members.length}</div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{t.members}</div>
            </div>

            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-800/30 p-5 text-center">
              <div className="text-3xl font-black text-violet-600 dark:text-violet-400 mb-1">
                {[...myEvents, ...joinedEvents].filter(e => e.teamId === currentTeam.id).length}
              </div>
              <div className="text-xs font-bold text-violet-400 uppercase tracking-wider">{t.events}</div>
            </div>

            {/* Leave team button */}
            {currentUser && currentTeam.members.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLeaveTeam}
                className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800/50 text-red-500 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                {t.leaveTeam}
              </motion.button>
            )}
          </div>

          {/* Events */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-indigo-500" />
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{t.events}</h3>
            </div>

            {(() => {
              const teamEvents = [...myEvents, ...joinedEvents].filter(e => e.teamId === currentTeam.id);
              if (teamEvents.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    <Calendar size={40} className="text-zinc-300 dark:text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">{t.noTeamEvents}</p>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  {teamEvents.map((event) => (
                    <button 
                      key={event.id} 
                      onClick={() => router.push(`/event/${event.id}`)}
                      className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{event.title}</h4>
                        <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                          <Clock size={12} />
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // --- Teams List View ---
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
      {showCreate && (
        <CreateTeamModal
          onCreated={handleCreateTeam}
          onCancel={() => setShowCreate(false)}
          language={language}
        />
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-10"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Users size={20} />
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">{t.title}</h1>
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 pl-1">{t.subtitle}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={16} />
          {t.createTeam}
        </motion.button>
      </motion.div>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-300 dark:text-violet-600 mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{t.noTeams}</h3>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6 max-w-xs">{t.noTeamsDesc}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            {t.createTeam}
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {teams.map((team) => (
            <motion.button
              key={team.id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                show: { y: 0, opacity: 1 }
              }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              onClick={() => setCurrentTeam(team)}
              className="group text-left bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xl">
                  {team.name[0].toUpperCase()}
                </div>
                <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors mt-1" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white mb-1 truncate">{team.name}</h3>
              {team.description && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 line-clamp-2">{team.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {team.members.length} {t.members}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {[...myEvents, ...joinedEvents].filter(e => e.teamId === team.id).length} {t.events}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

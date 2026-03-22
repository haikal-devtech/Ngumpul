"use client";

import { useState } from "react";
import { Users, Plus, ChevronRight, Star, Crown, Calendar, Hash, Trash2 } from "lucide-react";
import { useAppContext } from "@/components/AppContext";
import { Team } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
      id: Math.random().toString(36).substr(2, 9),
      name,
      description: desc,
      members: currentUser ? [{
        id: currentUser.id,
        name: currentUser.name,
        role: "admin" as const,
        photoUrl: currentUser.photoUrl
      }] : [],
      events: [],
      createdAt: new Date().toISOString(),
    };
    onCreated(team);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 w-full max-w-md shadow-2xl">
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
            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              {t.cancel}
            </button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
              {t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Teams Page ---
export default function TeamsPage() {
  const { language, currentUser, teams, setTeams, currentTeam, setCurrentTeam } = useAppContext();
  const [showCreate, setShowCreate] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/teams/join?team=${currentTeam?.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    });
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
  };

  const handleCreateTeam = (team: Team) => {
    setTeams((prev) => [team, ...prev]);
    setCurrentTeam(team);
    setShowCreate(false);
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

        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
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
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
              {t.created} {format(new Date(currentTeam.createdAt), "d MMM yyyy")}
            </div>
            <div className="flex gap-2">
               <button
                 onClick={handleCopyInvite}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${inviteCopied ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
               >
                 {inviteCopied ? (language === 'id' ? '✓ Tautan Disalin!' : '✓ Link Copied!') : (language === 'id' ? 'Undang Anggota' : 'Invite Members')}
               </button>
               <button
                 className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                 onClick={() => window.location.href = `/event/new?teamId=${currentTeam.id}`}
               >
                 {language === 'id' ? '+ Acara Baru' : '+ New Event'}
               </button>
            </div>
          </div>
        </div>

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
              <div className="text-3xl font-black text-violet-600 dark:text-violet-400 mb-1">{currentTeam.events?.length ?? 0}</div>
              <div className="text-xs font-bold text-violet-400 uppercase tracking-wider">{t.events}</div>
            </div>
          </div>

          {/* Events */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-indigo-500" />
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{t.events}</h3>
            </div>

            {(currentTeam.events?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                <Calendar size={40} className="text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">{t.noTeamEvents}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentTeam.events?.map((event) => (
                  <div key={event.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                    <h4 className="font-bold text-zinc-900 dark:text-white">{event.title}</h4>
                  </div>
                ))}
              </div>
            )}
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
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Users size={20} />
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">{t.title}</h1>
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 pl-1">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={16} />
          {t.createTeam}
        </button>
      </div>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-300 dark:text-violet-600 mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{t.noTeams}</h3>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6 max-w-xs">{t.noTeamsDesc}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            {t.createTeam}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setCurrentTeam(team)}
              className="group text-left bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-50 dark:hover:shadow-none transition-all"
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
                  {team.events?.length ?? 0} {t.events}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

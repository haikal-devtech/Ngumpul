"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/AppContext";
import { supabase } from "@/lib/supabase";
import { ChatRoom, ChatMessage, OnlineUser } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, Hash, Users, Send, Plus, X, LogIn,
  MoreVertical, Flag, Ban, Shield, ChevronLeft, ChevronRight, Wifi, WifiOff,
  UserPlus, Link2, Check, Pickaxe, Smile, Image as ImageIcon,
  Paperclip, Loader2, MapPin, BarChart2, Pin, PinOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { uploadChatMedia } from "@/lib/supabase";
import { Loader } from "@/components/ui/Loader";
import confetti from 'canvas-confetti';

// ── Memoized Message List ──────────────────────────────────────────────────
const ChatMessageList = React.memo(({ 
  groupedMessages, 
  currentUser, 
  polls, 
  t, 
  language,
  onFinalizePoll,
  onVote,
  onReport,
  onBlock,
  onDelete,
  onEdit,
  onLightbox,
  setContextMenu,
  formatTime
}: any) => {
  return (
    <>
      {groupedMessages.map((group: any) => (
        <div key={group.date}>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              {group.date}
            </span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>
          {group.msgs.map((msg: any, i: number) => {
            const isOwn = currentUser?.id === msg.senderId;
            const showAvatar = i === 0 || group.msgs[i - 1]?.senderId !== msg.senderId;
            return (
              <motion.div
                key={msg.id}
                id={`msg-${msg.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex gap-2.5 group",
                  showAvatar ? "mt-1.5" : "mt-0.5",
                  isOwn ? "flex-row-reverse" : ""
                )}
              >
                <div className="w-8 shrink-0">
                  {showAvatar && (
                    <img
                      src={msg.sender.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.name}`}
                      alt={msg.sender.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
                <div className={cn("max-w-[70%] min-w-0", isOwn ? "items-end" : "items-start")}>
                  {showAvatar && (
                    <div className={cn("flex items-center gap-2", isOwn ? "flex-row-reverse" : "")}>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {msg.sender.name || "User"}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {formatTime(msg.createdAt)}
                        {msg.updatedAt && msg.updatedAt !== msg.createdAt && !msg.isDeleted && (
                          <span className="ml-1 italic opacity-70">({language === 'id' ? 'diedit' : 'edited'})</span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="relative">
                    {msg.type === "image" && msg.mediaUrl ? (
                      <div className={cn(
                        "rounded-2xl overflow-hidden p-1 shadow-sm",
                        isOwn ? "bg-indigo-600 rounded-tr-md" : "bg-zinc-100 dark:bg-zinc-800 rounded-tl-md"
                      )}>
                        <img 
                          src={msg.mediaUrl} 
                          alt="Chat Attachment" 
                          className="max-w-full sm:max-w-xs h-auto max-h-64 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                          loading="lazy"
                          onClick={() => onLightbox(msg.mediaUrl!)}
                        />
                        {msg.content !== "Image" && (
                          <p className={cn("px-2 py-1.5 text-sm", isOwn ? "text-white" : "text-zinc-900 dark:text-zinc-100")}>
                            {msg.content}
                          </p>
                        )}
                      </div>
                    ) : msg.type === "emote" ? (
                      <div className="text-4xl px-2 py-1">
                        {msg.content}
                      </div>
                    ) : msg.type === "location" ? (
                      <div className={cn("p-1 rounded-2xl", isOwn ? "bg-indigo-600 rounded-tr-md" : "bg-zinc-100 dark:bg-zinc-800 rounded-tl-md")}>
                        <a href={`https://www.google.com/maps?q=${JSON.parse(msg.content).lat},${JSON.parse(msg.content).lng}`} target="_blank" rel="noreferrer">
                          <div className={cn("w-48 sm:w-56 h-36 rounded-xl flex flex-col items-center justify-center transition", isOwn ? "bg-indigo-700 hover:bg-indigo-800 text-indigo-200" : "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-500 dark:text-zinc-400")}>
                            <MapPin size={28} className={cn("mb-2", isOwn ? "text-white" : "text-red-500")} />
                            <span className={cn("text-xs font-bold text-center px-2", isOwn ? "text-white" : "text-zinc-700 dark:text-zinc-300")}>{JSON.parse(msg.content).label}</span>
                          </div>
                        </a>
                      </div>
                    ) : msg.type === "poll" ? (
                      (() => {
                        const pollId = msg.mediaUrl || msg.content;
                        const poll = polls.find((p: any) => p.id === pollId);
                        if (!poll) return <div className="text-sm italic text-zinc-500 px-3 py-2">Poll not found ({pollId?.substring(0,8)})</div>;
                        return (
                          <div className={cn("p-4 rounded-2xl w-64 shadow-sm border border-black/5 dark:border-white/5", isOwn ? "bg-indigo-600 text-white rounded-tr-md" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-md")}>
                            <div className="flex items-center gap-2 mb-3">
                              <BarChart2 size={18} className="shrink-0" />
                              <span className="font-bold text-sm leading-tight text-balance">{poll.question}</span>
                            </div>
                            <div className="space-y-2">
                              {poll.options.map((opt: any, idx: number) => {
                                const votesCount = opt.votes?.length || 0;
                                const totalVotes = poll.options.reduce((acc: number, o: any) => acc + (o.votes?.length || 0), 0);
                                const percent = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                                const hasVoted = opt.votes?.some((v: any) => v.userId === currentUser?.id);
                                const isFinished = poll.isFinalized;

                                return (
                                  <button
                                    key={idx}
                                    disabled={isFinished}
                                    onClick={() => onVote(poll.id, idx)}
                                    className={cn(
                                      "w-full text-left relative overflow-hidden rounded-xl border transition-all active:scale-[0.98]",
                                      isOwn 
                                        ? (hasVoted ? "bg-white/20 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10")
                                        : (hasVoted ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700")
                                    )}
                                  >
                                    <div 
                                      className={cn("absolute inset-0 transition-all duration-500", isOwn ? "bg-white/20" : "bg-indigo-500/10")} 
                                      style={{ width: `${percent}%` }} 
                                    />
                                    <div className="relative px-3 py-2.5 flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center shrink-0", isOwn ? "border-white/40" : "border-zinc-300 dark:border-zinc-600")}>
                                          {hasVoted && <div className={cn("w-2 h-2 rounded-full", isOwn ? "bg-white" : "bg-indigo-500")} />}
                                        </div>
                                        <span className={cn("text-xs font-medium truncate", isOwn ? "text-white" : "text-zinc-700 dark:text-zinc-200")}>{opt.text}</span>
                                      </div>
                                      <span className={cn("text-[10px] font-bold shrink-0", isOwn ? "text-white/80" : "text-zinc-400")}>{percent}%</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2">
                              <div className="text-[10px] font-medium opacity-70">
                                {poll.isFinalized ? (
                                  <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Check size={10} />
                                    {poll.options.every((o: any) => o.votes?.length > 0) ? (language === 'id' ? 'SEMUA MEMBER SETUJU' : 'ALL MEMBERS AGREED') : (language === 'id' ? 'SELESAI' : 'FINISHED')}
                                  </span>
                                ) : (
                                  `${poll.options.reduce((acc: number, o: any) => acc + (o.votes?.length || 0), 0)} votes`
                                )}
                              </div>
                              {isOwn && !poll.isFinalized && (
                                <button 
                                  onClick={() => onFinalizePoll(poll.id)}
                                  className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-[10px] font-bold transition-colors"
                                >
                                  {language === 'id' ? 'Finalisasi' : 'Finalize'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm break-words whitespace-pre-wrap leading-relaxed shadow-sm",
                          isOwn
                            ? "bg-indigo-600 text-white rounded-tr-md"
                            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-md"
                        )}
                      >
                        {msg.content}
                      </div>
                    )}
                    {isOwn && (
                      <div className="absolute -right-5 bottom-1 flex gap-0.5 opacity-50">
                        <Check size={10} className="text-indigo-400" />
                        <Check size={10} className="text-indigo-400 -ml-2" />
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1", isOwn ? "flex-row-reverse" : "")}>
                   <button 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setContextMenu({ 
                        x: rect.left, 
                        y: rect.top, 
                        messageId: msg.id, 
                        senderId: msg.senderId 
                      });
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400"
                   >
                      <MoreVertical size={14} />
                   </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </>
  );
});

// ── Memoized Message Input Area ───────────────────────────────────────────
const ChatInputArea = React.memo(({
  onSend,
  onFileUpload,
  onEmote,
  inputRef,
  fileInputRef,
  t,
  language,
  uploadingMedia,
  showAttachments,
  setShowAttachments,
  showEmojiPicker,
  setShowEmojiPicker,
  onLocation,
  onPoll,
  handleKeyDown
}: any) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend('text', text);
    setText("");
  };

  const handleEmojiInsert = (emojiData: EmojiClickData) => {
    setText(prev => prev + emojiData.emoji);
  };

  return (
    <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 relative shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-1">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full right-4 z-40 mb-2"
            >
              <EmojiPicker
                theme={Theme.AUTO}
                onEmojiClick={handleEmojiInsert}
                width={320}
                height={400}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment menu */}
        <div className="relative">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              showAttachments
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            )}
          >
            <Plus className={cn("transition-transform duration-200", showAttachments ? "rotate-45" : "")} size={20} />
          </button>

          <AnimatePresence>
            {showAttachments && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-full left-0 mb-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-2 min-w-[200px] z-50 overflow-hidden"
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ImageIcon size={18} />
                  </div>
                  <span className="text-sm font-bold">{t.attachPhoto}</span>
                </button>
                <button
                  onClick={onLocation}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-sm font-bold">{t.attachLocation}</span>
                </button>
                <button
                  onClick={onPoll}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <BarChart2 size={18} />
                  </div>
                  <span className="text-sm font-bold">{t.createPoll}</span>
                </button>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />
                <div className="p-2 grid grid-cols-4 gap-1">
                  {['🔥', '❤️', '👍', '😂', '😮', '😢', '👏', '🎉'].map(emote => (
                    <button
                      key={emote}
                      onClick={() => onEmote(emote)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-lg transition-transform active:scale-125"
                    >
                      {emote}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          className="hidden"
          accept="image/*"
        />

        <div className="flex-1 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-4 py-1 border border-transparent focus-within:border-indigo-500/30 focus-within:bg-white dark:focus-within:bg-black transition-all">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 min-h-[40px] text-zinc-900 dark:text-white"
            rows={1}
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-zinc-400 hover:text-indigo-500 transition-colors"
          >
            <Smile size={20} />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || uploadingMedia}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            text.trim()
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 active:scale-95"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
          )}
        >
          <Send size={18} className={text.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
        </button>
      </div>
    </div>
  );
});

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentUser, language, addToast } = useAppContext();

  // State
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showOnlinePanel, setShowOnlinePanel] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: ChatMessage } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ id: string; name: string; image: string }[]>([]);
  const [latestMedia, setLatestMedia] = useState<ChatMessage | null>(null);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [cancellingRoom, setCancellingRoom] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [polls, setPolls] = useState<any[]>([]);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState("");
  const [typingTimeoutRef, setTypingTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = {
    chatTitle: language === "id" ? "Obrolan" : "Chat",
    rooms: language === "id" ? "Ruang Obrolan" : "Chat Rooms",
    general: language === "id" ? "Umum" : "General",
    onlineUsers: language === "id" ? "Pengguna Online" : "Online Users",
    typeMessage: language === "id" ? "Ketik pesan..." : "Type a message...",
    signInToChat: language === "id" ? "Masuk untuk mulai mengobrol" : "Sign in to start chatting",
    signInPrompt: language === "id" ? "Masuk untuk bergabung dalam obrolan dan berinteraksi dengan pengguna lain." : "Sign in to join the chat and interact with other users.",
    signIn: language === "id" ? "Masuk" : "Sign In",
    cancel: language === "id" ? "Batal" : "Cancel",
    createRoom: language === "id" ? "Buat Ruang" : "Create Room",
    roomName: language === "id" ? "Nama Ruang" : "Room Name",
    roomDesc: language === "id" ? "Deskripsi (Opsional)" : "Description (Optional)",
    create: language === "id" ? "Buat" : "Create",
    report: language === "id" ? "Laporkan" : "Report",
    block: language === "id" ? "Blokir Pengguna" : "Block User",
    reportSuccess: language === "id" ? "Pesan dilaporkan" : "Message reported",
    blockSuccess: language === "id" ? "Pengguna diblokir" : "User blocked",
    noRooms: language === "id" ? "Belum ada ruang obrolan" : "No chat rooms yet",
    noMessages: language === "id" ? "Belum ada pesan. Mulai percakapan!" : "No messages yet. Start the conversation!",
    selectRoom: language === "id" ? "Pilih ruang obrolan" : "Select a chat room",
    members: language === "id" ? "anggota" : "members",
    online: language === "id" ? "online" : "online",
    connected: language === "id" ? "Terhubung" : "Connected",
    disconnected: language === "id" ? "Terputus" : "Disconnected",
    guestBanner: language === "id" ? "Masuk untuk mengirim pesan dan bergabung dalam percakapan" : "Sign in to send messages and join the conversation",
    inviteLink: language === "id" ? "Undang" : "Invite",
    inviteCopied: language === "id" ? "Tautan Disalin!" : "Link Copied!",
    inviteError: language === "id" ? "Gagal membuat tautan" : "Failed to generate link",
    blockedUsersTitle: language === "id" ? "Pengguna Diblokir" : "Blocked Users",
    unblock: language === "id" ? "Buka Blokir" : "Unblock",
    noBlockedUsers: language === "id" ? "Tidak ada pengguna yang diblokir" : "No blocked users",
    unblockSuccess: language === "id" ? "Pengguna berhasil dibuka blokirnya" : "User unblocked successfully",
    viewMembers: language === "id" ? "Info Grup" : "Group Info",
    kick: language === "id" ? "Keluarkan" : "Kick",
    kickSuccess: language === "id" ? "Anggota dikeluarkan" : "Member kicked",
    deleteRoom: language === "id" ? "Hapus Ruang" : "Delete Room",
    deleteRoomConfirm: language === "id" ? "Yakin ingin menghapus ruang ini?" : "Are you sure you want to delete this room?",
    kickConfirm: language === "id" ? "Yakin ingin mengeluarkan anggota ini?" : "Are you sure you want to kick this member?",
    createPoll: language === "id" ? "Buat Polling" : "Create Poll",
    question: language === "id" ? "Pertanyaan" : "Question",
    option: language === "id" ? "Pilihan" : "Option",
    addOption: language === "id" ? "Tambah Pilihan" : "Add Option",
    sendLocation: language === "id" ? "Bagikan Lokasi" : "Share Location",
    vote: language === "id" ? "Pilih" : "Vote",
  };

  // ── Fetch rooms ───────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        if (data.length > 0 && !selectedRoom) {
          setSelectedRoom(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedRoom, session]);

  const handlePinRoom = async (roomId: string, isPinned: boolean) => {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned })
      });
      if (res.ok) {
        addToast(isPinned ? 'Berhasil disematkan' : 'Sematkan dilepas', 'success');
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!messages.length) { setLatestMedia(null); return; }
    const media = [...messages].reverse().find(m => m.type === 'image' || m.type === 'location' || m.type === 'poll');
    setLatestMedia(media || null);
  }, [messages]);

  const scrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-indigo-50/50', 'dark:bg-indigo-900/10');
      setTimeout(() => el.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-900/10'), 2000);
    }
  };

  const handleFinalizePoll = async (pollId: string) => {
    try {
      const res = await fetch(`/api/chat/polls/${pollId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFinalized: true })
      });
      if (res.ok) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
        addToast(language === 'id' ? 'Polling difinalisasi!' : 'Poll finalized!', 'success');
        // Update local state is complex as polls are inside messages or in a separate state
        // Re-fetching polls is safer
        if (selectedRoom) fetchPolls(selectedRoom.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Fetch Polls ───────────────────────────────────────────────────────────
  const fetchPolls = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/polls`);
      if (res.ok) setPolls(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (selectedRoom) fetchPolls(selectedRoom.id);
  }, [selectedRoom, fetchPolls]);

  // ── Fetch messages ────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (roomId: string, cursor?: string | null) => {
    if (cursor) setLoadingMore(true);
    try {
      const url = new URL(`/api/chat/messages`, window.location.origin);
      url.searchParams.set("roomId", roomId);
      url.searchParams.set("limit", "50");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        // If loading older messages, prepend them. Otherwise, set as initial messages.
        if (cursor) {
           setMessages((prev) => [...data.messages, ...prev]);
        } else {
           setMessages(data.messages || []);
           // Scroll to bottom on initial load
           setTimeout(() => {
             if (chatContainerRef.current) {
               chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
             }
           }, 100);
        }
        setNextCursor(data.nextCursor || null);
        setHasMore(!!data.nextCursor);
      } else if (res.status === 403) {
         // unauthorized (not a member of a private room)
         addToast("Akses ditolak / Access Denied", "error");
         setSelectedRoom(null);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [addToast]);

  const loadMoreMessages = () => {
    if (!selectedRoom || !hasMore || loadingMore || !nextCursor) return;
    
    // Save current scroll height to adjust after prepending
    const container = chatContainerRef.current;
    const oldScrollHeight = container?.scrollHeight || 0;
    
    fetchMessages(selectedRoom.id, nextCursor).then(() => {
       if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
       }
    });
  };

  // ── Handle scroll to load more and show scroll-to-bottom button ───────────
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
    
    // Check if scrolled up more than 200px from the bottom
    const isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 200;
    setShowScrollButton(isScrolledUp);
    if (!isScrolledUp) {
      setUnreadCount(0); // Clear unread since they're at the bottom
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
    setUnreadCount(0);
    setShowScrollButton(false);
  };


  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideType?: 'text'|'image'|'sticker'|'emote'|'poll'|'location', overrideContent?: string, mediaUrl?: string) => {
    if (!session || !currentUser) {
      setShowLoginGate(true);
      return;
    }
    
    const type = overrideType || 'text';
    const contentToSend = overrideContent || newMessage;
    
    if (!selectedRoom || sendingMessage) return;
    if (type === 'text' && !contentToSend.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roomId: selectedRoom.id, 
          content: contentToSend.trim(),
          type,
          mediaUrl: mediaUrl || null
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
        inputRef.current?.focus();
        setTimeout(() => scrollToBottom(), 50); // Ensure scroll happens after DOM update
        
        // Broadcast via Supabase Realtime channel
        supabase.channel(`room:${selectedRoom.id}`).send({
          type: "broadcast",
          event: "new_message",
          payload: msg,
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMessage(false);
    }
  }, [session, currentUser, selectedRoom, sendingMessage, newMessage]);

  // ── Image Compression ─────────────────────────────────────────────────────
  const compressImage = (file: File): Promise<File | Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  // ── Handle Media Upload ───────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom || !currentUser) return;

    setUploadingMedia(true);
    setShowAttachments(false);
    try {
      let fileToUpload: File | Blob = file;
      if (file.size > 1024 * 1024) { // 1MB
        fileToUpload = await compressImage(file);
      }
      
      const { url, error } = await uploadChatMedia(fileToUpload as File, selectedRoom.id);
      if (error || !url) {
        addToast(language === 'id' ? 'Gagal mengunggah media' : 'Failed to upload media', 'error');
        return;
      }
      
      // Send image message once uploaded
      await sendMessage('image', 'Image', url);
    } catch {
      addToast(language === 'id' ? 'Gagal mengunggah media' : 'Failed to upload media', 'error');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };



  const sendEmote = (emoteName: string) => {
    sendMessage('emote', emoteName);
    setShowEmojiPicker(false);
    setShowAttachments(false);
  };
  
  // ── Create room ───────────────────────────────────────────────────────────
  const createRoom = async () => {
    if (!session) {
      setShowLoginGate(true);
      return;
    }
    if (!newRoomName.trim()) return;

    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoomName.trim(), description: newRoomDesc.trim() || null, isPrivate: true, requiresApproval: true }),
      });
      if (res.ok) {
        const room = await res.json();
        setRooms((prev) => [...prev, room]);
        setSelectedRoom(room);
        setShowCreateRoom(false);
        setNewRoomName("");
        setNewRoomDesc("");
      }
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  };

  // ── Generate Invite Link ──────────────────────────────────────────────────
  const generateInviteLink = async () => {
    if (!selectedRoom || generatingInvite) return;
    setGeneratingInvite(true);
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom.id}/invite`);
      if (res.ok) {
        const data = await res.json();
        const inviteUrl = `${window.location.origin}/chat/invite/${data.inviteCode}`;
        await navigator.clipboard.writeText(inviteUrl);
        setCopiedInvite(true);
        setTimeout(() => setCopiedInvite(false), 2000);
      } else {
        addToast(t.inviteError, "error");
      }
    } catch (err) {
      addToast(t.inviteError, "error");
    } finally {
      setGeneratingInvite(false);
    }
  };

  // ── Moderation: report ────────────────────────────────────────────────────
  const reportMessage = async (messageId: string) => {
    try {
      const res = await fetch("/api/chat/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report", messageId, reason: "Inappropriate content" }),
      });
      if (res.ok) addToast(t.reportSuccess, "success");
      else {
        const data = await res.json();
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error", "error");
    }
    setContextMenu(null);
  };

  // ── Moderation: block ─────────────────────────────────────────────────────
  const blockUser = async (userId: string) => {
    try {
      const res = await fetch("/api/chat/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block", targetUserId: userId }),
      });
      if (res.ok) {
        addToast(t.blockSuccess, "success");
        // Remove blocked user's messages from view
        setMessages((prev) => prev.filter((m) => m.senderId !== userId));
      } else {
        const data = await res.json();
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error", "error");
    }
    setContextMenu(null);
  };

  // ── Message Actions: Edit & Delete ───────────────────────────────────────
  const handleEditMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;
    try {
      const res = await fetch(`/api/chat/messages/${editingMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setEditingMessage(null);
        setEditContent("");
        addToast(language === 'id' ? 'Pesan diperbarui' : 'Message updated', 'success');
        
        // Broadcast update
        supabase.channel(`room:${selectedRoom!.id}`).send({
          type: "broadcast",
          event: "message_updated",
          payload: updated,
        });
      }
    } catch {
      addToast('Error', 'error');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    
    // Check 5-minute limit (unless admin)
    const isAdmin = roomMembers.find(m => m.userId === currentUser?.id)?.role === 'ADMIN';
    const isOwn = msg.senderId === currentUser?.id;
    const isWithin5Mins = Date.now() - new Date(msg.createdAt).getTime() < 5 * 60 * 1000;
    
    if (!isAdmin && isOwn && !isWithin5Mins) {
      addToast(language === 'id' ? 'Pesan tidak bisa dihapus setelah 5 menit' : 'Messages cannot be deleted after 5 minutes', 'error');
      return;
    }

    if (!window.confirm(language === 'id' ? 'Hapus pesan ini?' : 'Delete this message?')) return;
    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(language === 'id' ? 'Pesan dihapus' : 'Message deleted', 'success');
        // Update local state
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: language === 'id' ? 'Pesan telah dihapus' : 'Message deleted' } : m));
      }
    } catch (err) {
      console.error(err);
    }
    setContextMenu(null);
  };

  // ── Blocked Users ────────────────────────────────────────────────────────
  const fetchBlockedUsers = useCallback(async () => {
    setLoadingBlocked(true);
    try {
      const res = await fetch("/api/chat/moderation/blocked");
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch blocked users:", err);
    } finally {
      setLoadingBlocked(false);
    }
  }, []);

  const unblockUser = async (userId: string) => {
    try {
      const res = await fetch("/api/chat/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock", targetUserId: userId }),
      });
      if (res.ok) {
        addToast(t.unblockSuccess, "success");
        setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
        // Re-fetch messages to show unblocked user's messages
        if (selectedRoom) fetchMessages(selectedRoom.id);
      } else {
        const data = await res.json();
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error", "error");
    }
  };

  useEffect(() => {
    if (showBlockedUsers) fetchBlockedUsers();
  }, [showBlockedUsers, fetchBlockedUsers]);

  // ── Join Requests ────────────────────────────────────────────────────────
  const fetchJoinRequests = useCallback(async (roomId: string) => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/requests`);
      if (res.ok) {
        const data = await res.json();
        setJoinRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch join requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const handleJoinRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!selectedRoom) return;
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        addToast(
          action === 'approve' 
            ? (language === 'id' ? 'Permintaan disetujui' : 'Request approved')
            : (language === 'id' ? 'Permintaan ditolak' : 'Request rejected'),
          "success"
        );
        fetchJoinRequests(selectedRoom.id);
        fetchRooms(); // Refresh room list (in case membership count changed)
      } else {
        const data = await res.json();
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error", "error");
    }
  };

  useEffect(() => {
    if (showJoinRequests && selectedRoom) {
      fetchJoinRequests(selectedRoom.id);
    }
  }, [showJoinRequests, selectedRoom, fetchJoinRequests]);

  // ── Load rooms on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'loading') {
      fetchRooms();
    }
  }, [fetchRooms, status]);

  // ── Load messages when room changes ───────────────────────────────────────
  useEffect(() => {
    if (selectedRoom) fetchMessages(selectedRoom.id);
  }, [selectedRoom, fetchMessages]);

  // ── Auto-scroll to bottom only for initial load or new message sent ───────
  useEffect(() => {
    // Only auto-scroll to bottom if user is already near bottom
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      if (isNearBottom) {
        chatContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (selectedRoom && selectedRoom.createdById === currentUser?.id && selectedRoom.requiresApproval) {
      fetchJoinRequests(selectedRoom.id);
    } else {
      setJoinRequests([]);
    }
  }, [selectedRoom, currentUser, fetchJoinRequests]);

  // ── Supabase Realtime: per-room broadcast channel ─────────────────────────
  useEffect(() => {
    if (!selectedRoom) return;

    const channel = supabase.channel(`room:${selectedRoom.id}`);

    channel
      .on("broadcast", { event: "new_message" }, (payload) => {
        const msg = payload.payload as ChatMessage;
        // Avoid duplicating own messages (already added optimistically)
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          
          // If the user is scrolled up, increment unread count
          if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isScrolledUp = scrollHeight - scrollTop - clientHeight > 200;
            if (isScrolledUp) setUnreadCount(c => c + 1);
          }
          
          return [...prev, msg];
        });
      })
      .on("broadcast", { event: "message_updated" }, (payload) => {
        const msg = payload.payload as ChatMessage;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user } = payload.payload;
        if (user.id === currentUser?.id) return;
        
        setTypingUsers((prev) => {
          if (prev.some(u => u.id === user.id)) return prev;
          return [...prev, user];
        });
        
        // Remove after 3 seconds of no typing event
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter(u => u.id !== user.id));
        }, 3000);
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, currentUser]);

  // ── Typing Indicator Broadcast ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedRoom || !session || !currentUser || !newMessage.trim()) return;

    if (typingTimeoutRef) clearTimeout(typingTimeoutRef);

    const timeout = setTimeout(() => {
      const channel = supabase.channel(`room:${selectedRoom.id}`);
      channel.send({
        type: "broadcast",
        event: "typing",
        payload: { user: { id: currentUser.id, name: currentUser.name, image: currentUser.photoUrl } }
      });
    }, 500);

    setTypingTimeoutRef(timeout);
    return () => clearTimeout(timeout);
  }, [newMessage, selectedRoom, currentUser]);

  // ── Admin Actions & Member List ───────────────────────────────────────────
  const fetchRoomMembers = useCallback(async (roomId: string) => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/members`);
      if (res.ok) {
        setRoomMembers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const deleteRoom = async () => {
    if (!selectedRoom || !window.confirm(t.deleteRoomConfirm)) return;
    setCancellingRoom(true);
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom.id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(language === 'id' ? 'Ruang dihapus' : 'Room deleted', 'success');
        setSelectedRoom(null);
        setShowMembers(false);
        fetchRooms();
      } else {
        const data = await res.json();
        addToast(data.error || 'Error', 'error');
      }
    } catch {
      addToast('Error', 'error');
    } finally {
      setCancellingRoom(false);
    }
  };

  const kickMember = async (userId: string) => {
    if (!selectedRoom || !window.confirm(t.kickConfirm)) return;
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom.id}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      if (res.ok) {
        addToast(t.kickSuccess, 'success');
        fetchRoomMembers(selectedRoom.id);
      } else {
        const data = await res.json();
        addToast(data.error || 'Error', 'error');
      }
    } catch {
      addToast('Error', 'error');
    }
  };

  useEffect(() => {
    if (showMembers && selectedRoom) fetchRoomMembers(selectedRoom.id);
  }, [showMembers, selectedRoom, fetchRoomMembers]);

  // ── Poll & Location Actions ───────────────────────────────────────────────
  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2 || !selectedRoom) return;
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom.id}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: pollQuestion, options: pollOptions.filter(o => o.trim()) })
      });
      if (res.ok) {
        const poll = await res.json();
        setPolls(prev => [poll, ...prev]);
        setShowPollModal(false);
        const question = pollQuestion.trim();
        setPollQuestion("");
        setPollOptions(["", ""]);
        await sendMessage('poll', question, poll.id);
      }
    } catch {
      addToast('Error creating poll', 'error');
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!selectedRoom || !currentUser) return setShowLoginGate(true);
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom.id}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex })
      });
      if (res.ok) fetchPolls(selectedRoom.id);
    } catch {
      console.error('Failed to vote');
    }
  };

  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      addToast(language === 'id' ? 'Geolokasi tidak didukung browser ini' : 'Geolocation is not supported by your browser', 'error');
      return;
    }
    setSendingLocation(true);
    setShowAttachments(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = JSON.stringify({ lat: latitude, lng: longitude, label: language === 'id' ? 'Lokasi Saya' : 'My Location' });
        sendMessage('location', locationData);
        setSendingLocation(false);
      },
      () => {
        addToast(language === 'id' ? 'Gagal mendapatkan lokasi' : 'Failed to get location', 'error');
        setSendingLocation(false);
      }
    );
  };

  // ── Supabase Presence: online users ───────────────────────────────────────
  useEffect(() => {
    if (!selectedRoom || !currentUser) return;

    const presenceChannel = supabase.channel(`presence:${selectedRoom.id}`);

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const users: OnlineUser[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (!users.some((u) => u.id === p.id)) {
              users.push({ id: p.id, name: p.name, image: p.image, online_at: p.online_at });
            }
          });
        });
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            id: currentUser.id,
            name: currentUser.name,
            image: currentUser.photoUrl,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [selectedRoom, currentUser]);

  // ── Close context menu on click outside ───────────────────────────────────
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // ── Keyboard shortcut: Enter to send ──────────────────────────────────────


  // ── Format timestamp ──────────────────────────────────────────────────────
  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "HH:mm");
    } catch {
      return "";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return "";
    }
  };

  // ── Group messages by date ────────────────────────────────────────────────
  const groupedMessages = useMemo(() => {
    const groups: { date: string; msgs: ChatMessage[] }[] = [];
    messages.forEach((msg) => {
      const date = formatDate(msg.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.date === date) {
        last.msgs.push(msg);
      } else {
        groups.push({ date, msgs: [msg] });
      }
    });
    return groups;
  }, [messages]);

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  return (
    <div className="pt-16 h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex overflow-hidden">
      {/* ── Left Sidebar: Room List ────────────────────────────────────────── */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-80 max-w-[85vw] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col fixed md:relative z-30 top-16 bottom-0 md:top-0"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-lg text-zinc-900 dark:text-white">{t.rooms}</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (!session) { setShowLoginGate(true); return; }
                    setShowCreateRoom(true);
                  }}
                  className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                  title={t.createRoom}
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="w-8 h-8 rounded-lg md:hidden text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Connection indicator */}
            <div className="px-4 py-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 opacity-60">
              {status === 'loading' ? (
                <>
                  <Loader2 size={10} className="animate-spin" />
                  CONNECTING...
                </>
              ) : selectedRoom ? (
                isConnected ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    ONLINE
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    TERPUTUS
                  </>
                )
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  CONNECTED
                </>
              )}
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <Loader className="py-12" />
              ) : rooms.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Hash size={32} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.noRooms}</p>
                  <button
                    onClick={() => {
                      if (!session) { setShowLoginGate(true); return; }
                      setShowCreateRoom(true);
                    }}
                    className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t.createRoom}
                  </button>
                </div>
              ) : (
                [...rooms]
                  .sort((a, b) => {
                    const aPinned = a.members?.some((m: any) => m.userId === currentUser?.id && m.isPinned) ? 1 : 0;
                    const bPinned = b.members?.some((m: any) => m.userId === currentUser?.id && m.isPinned) ? 1 : 0;
                    return bPinned - aPinned;
                  })
                  .map((room) => {
                    const isSelected = selectedRoom?.id === room.id;
                    const isPinned = room.members?.some((m: any) => m.userId === currentUser?.id && m.isPinned);
                    return (
                      <button
                        key={room.id}
                        onClick={() => handleRoomSelect(room)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group relative",
                          isSelected
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                          isSelected ? "bg-white/20" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500"
                        )}>
                          <Hash size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-bold text-sm truncate">{room.name}</div>
                            {isPinned && <Pin size={12} className={cn(isSelected ? "text-white/70" : "text-indigo-400")} />}
                          </div>
                          {room._count && (
                            <div className={cn("text-[10px] mt-0.5", isSelected ? "text-white/60" : "text-zinc-400 dark:text-zinc-500")}>
                              {room._count.members} {t.members}
                            </div>
                          )}
                        </div>
                        {/* Pin Toggle Button */}
                        {!isSelected && (
                          <div 
                            onClick={(e) => { e.stopPropagation(); handlePinRoom(room.id, !isPinned); }}
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-opacity"
                          >
                            {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
                          </div>
                        )}
                      </button>
                    );
                  })
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Sidebar overlay on mobile ──────────────────────────────────────── */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="w-8 h-8 rounded-lg md:hidden text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Hash size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{selectedRoom.name}</h3>
                  <div className="flex items-center gap-2 overflow-hidden h-4">
                    <AnimatePresence mode="wait">
                      {typingUsers.length > 0 ? (
                        <motion.div
                          key="typing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-1.5"
                        >
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {typingUsers.map(user => (
                              <img 
                                key={user.id} 
                                src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                                className="w-3.5 h-3.5 rounded-full border border-white dark:border-zinc-950 object-cover" 
                                alt={user.name} 
                              />
                            ))}
                          </div>
                          <p className="text-[10px] font-bold text-indigo-500 animate-pulse uppercase tracking-wider">
                            {typingUsers.length === 1 
                              ? `${typingUsers[0].name.split(' ')[0]} ${language === 'id' ? 'sedang mengetik...' : 'is typing...'}`
                              : `${typingUsers.length} ${language === 'id' ? 'orang mengetik...' : 'people typing...'}`}
                          </p>
                        </motion.div>
                      ) : selectedRoom.description ? (
                        <motion.p 
                          key="desc"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]"
                        >
                          {selectedRoom.description}
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session && currentUser && (
                  <button
                    onClick={generateInviteLink}
                    disabled={generatingInvite}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    {generatingInvite ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : copiedInvite ? (
                      <Check size={14} />
                    ) : (
                      <UserPlus size={14} />
                    )}
                    <span className="hidden sm:inline">
                      {copiedInvite ? t.inviteCopied : t.inviteLink}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setShowOnlinePanel(!showOnlinePanel)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                    showOnlinePanel
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Users size={14} />
                  <span className="hidden sm:inline">{onlineUsers.length} {t.online}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                {/* Blocked Users */}
                {session && currentUser && (
                  <button
                    onClick={() => setShowBlockedUsers(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title={t.blockedUsersTitle}
                  >
                    <Ban size={16} />
                  </button>
                )}

                {/* Join Requests */}
                {selectedRoom?.createdById === currentUser?.id && selectedRoom.requiresApproval && (
                  <button
                    onClick={() => setShowJoinRequests(true)}
                    className="relative w-9 h-9 flex items-center justify-center rounded-lg text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                    title={language === 'id' ? 'Permintaan Bergabung' : 'Join Requests'}
                  >
                    <Shield size={16} />
                    {joinRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {joinRequests.length}
                      </span>
                    )}
                  </button>
                )}

                {/* Group Info / Menu */}
                <button
                  onClick={() => setShowMembers(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title={t.viewMembers}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages + Online Users */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Media Pin Header */}
              <AnimatePresence>
                {latestMedia && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    onClick={() => scrollToMessage(latestMedia.id)}
                    className="absolute top-0 inset-x-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-zinc-100 dark:border-zinc-800 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 shrink-0">
                        {latestMedia.type === 'image' && <ImageIcon size={14} />}
                        {latestMedia.type === 'location' && <MapPin size={14} />}
                        {latestMedia.type === 'poll' && <BarChart2 size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                          {latestMedia.type === 'image' ? (language === 'id' ? 'FOTO TERBARU' : 'LATEST PHOTO') : 
                           latestMedia.type === 'location' ? (language === 'id' ? 'LOKASI TERBARU' : 'LATEST LOCATION') : 
                           (language === 'id' ? 'POLLING TERBARU' : 'LATEST POLL')}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {latestMedia.type === 'poll' ? latestMedia.content : (latestMedia.mediaUrl || (language === 'id' ? 'Ketuk untuk melihat' : 'Tap to view'))}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-zinc-400 shrink-0" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 flex overflow-hidden">
                {/* Message Feed */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-1 relative"
              >
                {/* Visual loading feedback while sending */}
                <AnimatePresence>
                  {(sendingMessage || uploadingMedia) && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 bottom-4 flex justify-center z-10 pointer-events-none"
                     >
                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                           <Loader2 size={14} className="animate-spin text-indigo-500" />
                           <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                             {uploadingMedia ? (language === 'id' ? 'Mengunggah...' : 'Uploading...') : (language === 'id' ? 'Mengirim...' : 'Sending...')}
                           </span>
                        </div>
                     </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading older messages indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-4">
                     <Loader2 size={20} className="animate-spin text-indigo-400" />
                  </div>
                )}
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                      <MessageCircle size={28} className="text-indigo-400" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.noMessages}</p>
                  </div>
                ) : (
                  <ChatMessageList 
                    groupedMessages={groupedMessages} 
                    currentUser={currentUser} 
                    polls={polls} 
                    t={t} 
                    language={language}
                    onFinalizePoll={handleFinalizePoll}
                    onVote={handleVote}
                    onReport={reportMessage}
                    onBlock={blockUser}
                    onDelete={handleDeleteMessage}
                    onEdit={(msg: any) => { setEditingMessage(msg); setEditContent(msg.content); }}
                    onLightbox={(url: string) => setLightboxImage(url)}
                    setContextMenu={setContextMenu}
                    formatTime={formatTime}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Online Users Panel (desktop) */}
              <AnimatePresence>
                {showOnlinePanel && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="hidden lg:block border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
                  >
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                      <h4 className="font-bold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                        {t.onlineUsers} — {onlineUsers.length}
                      </h4>
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto">
                      {onlineUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950" />
                          </div>
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                            {user.name}
                          </span>
                        </div>
                      ))}
                      {onlineUsers.length === 0 && (
                        <p className="text-xs text-zinc-400 text-center py-4">
                          {language === "id" ? "Tidak ada yang online" : "No one online"}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Message Input / Guest Banner */}
            {/* Message Input / Guest Banner */}
            {session && currentUser ? (
              <ChatInputArea 
                onSend={sendMessage} 
                onFileUpload={handleFileUpload}
                onEmote={sendEmote}
                inputRef={inputRef}
                fileInputRef={fileInputRef}
                t={t}
                language={language}
                uploadingMedia={uploadingMedia}
                showAttachments={showAttachments}
                setShowAttachments={setShowAttachments}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                onLocation={handleSendLocation}
                onPoll={() => setShowPollModal(true)}
              />
            ) : (
              <div className="border-t border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-50 via-white to-violet-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <LogIn size={18} />
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.guestBanner}</p>
                  </div>
                  <button
                    onClick={() => {
                      sessionStorage.setItem("ngumpul_redirect_after_login", "/chat");
                      router.push("/login");
                    }}
                    className="shrink-0 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                  >
                    {t.signIn}
                  </button>
                </div>
              </div>
            )}
          </div>
          </>
        ) : (
          /* No room selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden mb-4 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            >
              {t.rooms}
            </button>
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <MessageCircle size={36} className="text-zinc-300 dark:text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{t.selectRoom}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              {language === "id"
                ? "Pilih ruang obrolan di sidebar atau buat ruang baru untuk memulai percakapan."
                : "Select a chat room from the sidebar or create a new one to start a conversation."
              }
            </p>
          </div>
        )}
      </div>

      {/* ── Context Menu ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-1 min-w-[160px]"
            onClick={(e) => e.stopPropagation()}
          >
            {session && currentUser?.id === contextMenu.message.senderId ? (
              <>
                <button
                  onClick={() => {
                    setEditingMessage(contextMenu.message);
                    setEditContent(contextMenu.message.content);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <Pickaxe size={14} className="text-indigo-500" />
                  {language === 'id' ? 'Edit Pesan' : 'Edit Message'}
                </button>
                <button
                  onClick={() => handleDeleteMessage(contextMenu.message.id)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2.5 transition-colors"
                >
                  <Ban size={14} />
                  {language === 'id' ? 'Hapus Pesan' : 'Delete Message'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => reportMessage(contextMenu.message.id)}
                  className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <Flag size={14} className="text-amber-500" />
                  {t.report}
                </button>
                <button
                  onClick={() => blockUser(contextMenu.message.senderId)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2.5 transition-colors"
                >
                  <Ban size={14} />
                  {t.block}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Blocked Users Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBlockedUsers && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlockedUsers(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <Ban size={18} className="text-red-500" />
                    {t.blockedUsersTitle}
                  </h3>
                  <button
                    onClick={() => setShowBlockedUsers(false)}
                    className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                {loadingBlocked ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-indigo-400" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">{t.noBlockedUsers}</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {blockedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            alt={user.name || "User"}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <span className="font-medium text-sm text-zinc-900 dark:text-white">{user.name || "User"}</span>
                        </div>
                        <button
                          onClick={() => unblockUser(user.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          {t.unblock}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Create Room Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateRoom && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateRoom(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{t.createRoom}</h3>
                  <button
                    onClick={() => setShowCreateRoom(false)}
                    className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t.roomName}</label>
                    <input
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder={language === "id" ? "Contoh: Diskusi Umum" : "e.g., General Discussion"}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t.roomDesc}</label>
                    <input
                      value={newRoomDesc}
                      onChange={(e) => setNewRoomDesc(e.target.value)}
                      placeholder={language === "id" ? "Deskripsi singkat..." : "A brief description..."}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowCreateRoom(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={createRoom}
                      disabled={!newRoomName.trim()}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t.create}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Poll Creation Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPollModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPollModal(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 mx-4">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <BarChart2 size={18} className="text-indigo-500" />
                    {t.createPoll}
                  </h3>
                  <button
                    onClick={() => setShowPollModal(false)}
                    className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{t.question}</label>
                    <input
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder={language === 'id' ? "Apa yang akan kita makan?" : "What should we eat?"}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all font-medium text-zinc-900 dark:text-white placeholder:font-normal"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{t.option}s</label>
                    <div className="space-y-2">
                      {pollOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...pollOptions];
                              newOpts[i] = e.target.value;
                              setPollOptions(newOpts);
                            }}
                            placeholder={`${t.option} ${i + 1}`}
                            className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 transition-colors text-zinc-900 dark:text-white"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                              className="text-zinc-400 hover:text-red-500 p-1 transition"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 6 && (
                        <button
                          onClick={() => setPollOptions([...pollOptions, ""])}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-2 hover:underline"
                        >
                          <Plus size={12} /> {t.addOption}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleCreatePoll}
                      disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t.create}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Login Gate Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLoginGate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginGate(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 mx-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-5">
                  <Shield size={28} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t.signInToChat}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{t.signInPrompt}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLoginGate(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={() => {
                      sessionStorage.setItem("ngumpul_redirect_after_login", "/chat");
                      router.push("/login");
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn size={16} />
                    {t.signIn}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Admin Join Requests Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showJoinRequests && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJoinRequests(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 mx-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {language === 'id' ? 'Permintaan Bergabung' : 'Join Requests'}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {selectedRoom?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJoinRequests(false)}
                    className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {loadingRequests ? (
                    <div className="flex justify-center p-8 text-zinc-400">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : joinRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
                        <Users size={24} className="text-zinc-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {language === 'id' ? 'Tidak ada permintaan tertunda.' : 'No pending requests.'}
                      </p>
                    </div>
                  ) : (
                    joinRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                        <div className="flex items-center gap-3 w-full min-w-0">
                          {req.user.image ? (
                            <img src={req.user.image} alt={req.user.name || "User"} className="w-10 h-10 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                              {req.user.name?.[0].toUpperCase() || "?"}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                              {req.user.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">
                              {req.user.email}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              onClick={() => handleJoinRequest(req.id, 'reject')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                            >
                              {language === 'id' ? 'Tolak' : 'Reject'}
                            </button>
                            <button
                              onClick={() => handleJoinRequest(req.id, 'approve')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                            >
                              {language === 'id' ? 'Setujui' : 'Approve'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Group Info / Members Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showMembers && selectedRoom && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMembers(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{t.viewMembers}</h3>
                  <button
                    onClick={() => setShowMembers(false)}
                    className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                   <h4 className="font-bold text-zinc-900 dark:text-white mb-1">{selectedRoom.name}</h4>
                   <p className="text-sm text-zinc-500">{selectedRoom.description || (language === 'id' ? 'Tidak ada deskripsi' : 'No description')}</p>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto mb-6 pr-1">
                  {loadingMembers ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-zinc-400" /></div>
                  ) : (
                    roomMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={member.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.name}`} alt={member.user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                              {member.user.name} 
                              {member.role === 'admin' && <span className="ml-2 text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md">Admin</span>}
                              {member.user.id === currentUser?.id && <span className="ml-2 text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">You</span>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Kick Button */}
                        {selectedRoom.createdById === currentUser?.id && member.user.id !== currentUser?.id && member.role !== 'admin' && (
                          <button
                            onClick={() => kickMember(member.user.id)}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition"
                          >
                            {t.kick}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {selectedRoom.createdById === currentUser?.id && (
                  <button
                    onClick={deleteRoom}
                    disabled={cancellingRoom}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
                  >
                    {cancellingRoom ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                    {t.deleteRoom}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Edit Message Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingMessage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMessage(null)}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Pickaxe size={18} className="text-indigo-500" />
                    {language === 'id' ? 'Edit Pesan' : 'Edit Message'}
                  </h3>
                  <button
                    onClick={() => setEditingMessage(null)}
                    className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all min-h-[100px] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingMessage(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleEditMessage}
                      disabled={!editContent.trim() || editContent === editingMessage.content}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {language === 'id' ? 'Simpan' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Image Lightbox Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
              onClick={() => setLightboxImage(null)}
            >
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={lightboxImage}
              alt="Fullscreen Viewer"
              className="max-w-full max-h-full object-contain cursor-default select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/AppContext";
import { supabase } from "@/lib/supabase";
import { ChatRoom, ChatMessage, OnlineUser } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, Hash, Users, Send, Plus, X, LogIn,
  MoreVertical, Flag, Ban, Shield, ChevronLeft, Wifi, WifiOff,
  UserPlus, Link2, Check, Pickaxe, Smile, Image as ImageIcon,
  Paperclip, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { uploadChatMedia } from "@/lib/supabase";
import { Loader } from "@/components/ui/Loader";

export default function ChatPage() {
  const { data: session } = useSession();
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
  }, [selectedRoom]);

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

  // ── Handle scroll to load more ────────────────────────────────────────────
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (overrideType?: 'text'|'image'|'sticker'|'emote', overrideContent?: string, mediaUrl?: string) => {
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
  };

  // ── Handle Media Upload ───────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom || !currentUser) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast(language === 'id' ? 'Ukuran file maksimal 5MB' : 'Max file size is 5MB', 'error');
      return;
    }

    setUploadingMedia(true);
    setShowAttachments(false);
    try {
      const { url, error } = await uploadChatMedia(file, selectedRoom.id);
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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
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
        body: JSON.stringify({ name: newRoomName.trim(), description: newRoomDesc.trim() || null }),
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
        method: "PUT",
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
    fetchRooms();
  }, [fetchRooms]);

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
          return [...prev, msg];
        });
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom]);

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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
  const groupedMessages: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  });

  return (
    <div className="pt-16 min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex">
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
            <div className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest",
              isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
            )}>
              {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isConnected ? t.connected : t.disconnected}
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
                rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      if (window.innerWidth < 768) setShowSidebar(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-3 group",
                      selectedRoom?.id === room.id
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      selectedRoom?.id === room.id
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                    )}>
                      <Hash size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm truncate">{room.name}</div>
                      {room._count && (
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {room._count.members} {t.members}
                        </div>
                      )}
                    </div>
                  </button>
                ))
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
                  {selectedRoom.description && (
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">
                      {selectedRoom.description}
                    </p>
                  )}
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

                {/* Admin-only: Join Requests */}
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
              </div>
            </div>

            {/* Messages + Online Users */}
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
                  groupedMessages.map((group) => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                          {group.date}
                        </span>
                        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                      </div>
                      {group.msgs.map((msg, i) => {
                        const isOwn = currentUser?.id === msg.senderId;
                        const showAvatar = i === 0 || group.msgs[i - 1]?.senderId !== msg.senderId;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              "flex gap-2.5 group",
                              showAvatar ? "mt-3" : "mt-0.5",
                              isOwn ? "flex-row-reverse" : ""
                            )}
                          >
                            {/* Avatar */}
                            <div className="w-8 shrink-0">
                              {showAvatar && (
                                <img
                                  src={msg.sender.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.name}`}
                                  alt={msg.sender.name || "User"}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                            </div>
                            {/* Message bubble */}
                            <div className={cn("max-w-[70%] min-w-0", isOwn ? "items-end" : "items-start")}>
                              {showAvatar && (
                                <div className={cn("flex items-center gap-2 mb-0.5", isOwn ? "flex-row-reverse" : "")}>
                                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                    {msg.sender.name || "User"}
                                  </span>
                                  <span className="text-[10px] text-zinc-400">{formatTime(msg.createdAt)}</span>
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
                                      className="max-w-full sm:max-w-xs h-auto max-h-64 object-cover rounded-xl"
                                      loading="lazy"
                                    />
                                    {msg.content !== "Image" && (
                                      <p className={cn("px-2 py-1.5 text-sm", isOwn ? "text-white" : "text-zinc-900 dark:text-锌-100")}>
                                        {msg.content}
                                      </p>
                                    )}
                                  </div>
                                ) : msg.type === "emote" ? (
                                  <div className="text-4xl px-2 py-1">
                                    {msg.content}
                                  </div>
                                ) : (
                                  <div
                                    className={cn(
                                      "px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words",
                                      isOwn
                                        ? "bg-indigo-600 text-white rounded-tr-md"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-md"
                                    )}
                                  >
                                    {msg.content}
                                  </div>
                                )}
                                {/* Context menu trigger */}
                                {session && !isOwn && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
                                    }}
                                    className="absolute top-1 -right-7 w-5 h-5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                  >
                                    <MoreVertical size={12} />
                                  </button>
                                )}
                              </div>
                              {!showAvatar && (
                                <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                  {formatTime(msg.createdAt)}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))
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
            {session && currentUser ? (
              <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 sm:p-4 relative">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                
                {/* Emoji / Attachments popover */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-4 md:mb-6 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={Theme.AUTO}
                        lazyLoadEmojis={true}
                        searchDisabled={false}
                        skinTonesDisabled={true}
                        height={350}
                        width={300}
                      />
                    </motion.div>
                  )}
                  {showAttachments && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-4 left-4 z-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-48 p-2 flex flex-col gap-1"
                    >
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        <ImageIcon size={16} className="text-blue-500" />
                        {language === 'id' ? 'Gambar' : 'Image'}
                      </button>
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                      <div className="px-3 py-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {language === 'id' ? 'Kirim Emote' : 'Send Emote'}
                      </div>
                      <div className="flex gap-2 p-2">
                        {['👍', '❤️', '🔥', '🎉'].map(emote => (
                          <button
                            key={emote}
                            onClick={() => sendEmote(emote)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xl transition-transform hover:scale-125 focus:outline-none"
                          >
                            {emote}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-2 py-2 border border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setShowAttachments(!showAttachments);
                        setShowEmojiPicker(false);
                      }}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors focus:outline-none",
                        showAttachments ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowAttachments(false);
                      }}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors focus:outline-none hidden sm:flex",
                        showEmojiPicker ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-white" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Smile size={18} />
                    </button>
                  </div>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={uploadingMedia ? (language==='id'?'Mengunggah...':'Uploading...') : t.typeMessage}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 px-2 min-w-0"
                    disabled={sendingMessage || uploadingMedia}
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage('text')}
                    disabled={!newMessage.trim() || sendingMessage || uploadingMedia}
                    className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 focus:outline-none",
                      newMessage.trim()
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                    )}
                  >
                    {uploadingMedia ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
                  </motion.button>
                </div>
              </div>
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
          </motion.div>
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
    </div>
  );
}

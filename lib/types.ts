export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  photoUrl: string;
}

export interface TimeSlot {
  id: string;
  time: string; // e.g., "08:00"
  date: string; // ISO string
}

export interface Participant {
  id: string;
  name: string;
  photoUrl?: string;
  availability: string[]; // Array of TimeSlot IDs
}

export interface TeamMember {
  id: string;
  name: string;
  role: "admin" | "member";
  photoUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  events?: NgumpulEvent[];
  color?: string;
  createdAt: string;
  inviteCode: string;
}


export interface NgumpulEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  dates: string[]; // ISO strings
  startTime: string; // "08:00"
  endTime: string; // "22:00"
  participants: Participant[];
  confirmedSlot?: string;
  teamId?: string;
  status?: 'active' | 'cancelled';
  role?: 'host' | 'guest';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ── Chat Types ──────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  name: string;
  description?: string | null;
  type: 'general' | 'event' | 'team';
  isPrivate: boolean;
  requiresApproval: boolean;
  eventId?: string | null;
  createdById: string;
  createdAt: string;
  createdBy?: { id: string; name: string | null; image: string | null };
  _count?: { members: number; messages: number };
  members?: { role: string }[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'sticker' | 'emote' | 'poll' | 'location';
  mediaUrl?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender: { id: string; name: string | null; image: string | null };
}

export interface ChatMember {
  id: string;
  roomId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface OnlineUser {
  id: string;
  name: string;
  image?: string | null;
  online_at: string;
}

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

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: number;
  color: string;
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
}

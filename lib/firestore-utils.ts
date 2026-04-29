import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  serverTimestamp,
  limit,
  startAfter
} from "firebase/firestore";

import { db } from "./firebase";

export const eventsCollection = collection(db, "events");
export const usersCollection = collection(db, "users");

export interface FirestoreEvent {
  id?: string;
  slug: string;
  title: string;
  desc?: string;
  location_name?: string;
  location_address?: string;
  lat?: number;
  lng?: number;
  place_id?: string;
  host_id: string;
  date_range: string[];
  time_range: string[];
  timezone: string;
  deadline?: Date | null;
  status: string;
  team_id?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export const getEventsByHost = async (hostId: string) => {
  const q = query(eventsCollection, where("host_id", "==", hostId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createEvent = async (eventData: FirestoreEvent) => {
  const docRef = await addDoc(eventsCollection, {
    ...eventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...eventData };
};

export const getEventBySlug = async (slug: string) => {
  const q = query(eventsCollection, where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const eventDoc = querySnapshot.docs[0];
  const eventData = { id: eventDoc.id, ...eventDoc.data() } as any;

  // Fetch participants
  const participantsCol = collection(db, "events", eventDoc.id, "participants");
  const participantsSnapshot = await getDocs(participantsCol);
  eventData.participants = participantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return eventData;
};

export const updateEvent = async (eventId: string, data: any) => {
  const docRef = doc(db, "events", eventId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const upsertParticipant = async (eventId: string, participantId: string, data: any) => {
  const docRef = doc(db, "events", eventId, "participants", participantId);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getParticipantByGuestName = async (eventId: string, guestName: string) => {
  const participantsCol = collection(db, "events", eventId, "participants");
  const q = query(participantsCol, where("guest_name", "==", guestName));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

export const chatRoomsCollection = collection(db, "chatRooms");

export const getChatRooms = async (userId?: string) => {
  let q;
  if (!userId) {
    q = query(chatRoomsCollection, where("isPrivate", "==", false), orderBy("createdAt", "asc"));
  } else {
    q = query(chatRoomsCollection, orderBy("createdAt", "asc"));
  }
  
  const querySnapshot = await getDocs(q);
  const rooms = [];
  for (const docSnapshot of querySnapshot.docs) {
    const data = docSnapshot.data();
    if (data.isPrivate && userId) {
      const memberRef = doc(db, "chatRooms", docSnapshot.id, "members", userId);
      const memberDoc = await getDoc(memberRef);
      if (!memberDoc.exists()) continue;
    }
    rooms.push({ id: docSnapshot.id, ...data });
  }
  return rooms;
};

export const createChatRoom = async (roomData: any, creatorId: string) => {
  const docRef = await addDoc(chatRoomsCollection, {
    ...roomData,
    createdById: creatorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  await setDoc(doc(db, "chatRooms", docRef.id, "members", creatorId), {
    userId: creatorId,
    role: "admin",
    joinedAt: serverTimestamp(),
  });
  
  return { id: docRef.id, ...roomData };
};

export const createChatMessage = async (messageData: any) => {
  const { roomId, ...rest } = messageData;
  const messagesCol = collection(db, "chatRooms", roomId, "messages");
  const docRef = await addDoc(messagesCol, {
    ...rest,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, roomId, ...rest };
};

export const getChatMessages = async (roomId: string, limitCount: number = 50, cursor?: string) => {
  const messagesCol = collection(db, "chatRooms", roomId, "messages");
  let q = query(messagesCol, where("isDeleted", "==", false), orderBy("createdAt", "desc"), limit(limitCount + 1));
  
  if (cursor) {
    const cursorDoc = await getDoc(doc(db, "chatRooms", roomId, "messages", cursor));
    q = query(messagesCol, where("isDeleted", "==", false), orderBy("createdAt", "desc"), startAfter(cursorDoc), limit(limitCount + 1));
  }
  
  const querySnapshot = await getDocs(q);
  const messages = querySnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
  return messages;
};

export const getChatRoom = async (roomId: string) => {
  const docRef = doc(db, "chatRooms", roomId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  const membersCol = collection(db, "chatRooms", roomId, "members");
  const membersSnapshot = await getDocs(membersCol);
  return { id: docSnap.id, ...data, members: membersSnapshot.docs.map(docSnapshot => docSnapshot.data()) };
};

export const addChatMember = async (roomId: string, userId: string, role: string = "member") => {
  await setDoc(doc(db, "chatRooms", roomId, "members", userId), {
    userId,
    role,
    joinedAt: serverTimestamp(),
  });
};

export const updateUserProfile = async (userId: string, data: any) => {
  const docRef = doc(db, "users", userId);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return data;
};

export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const getParticipantLocations = async (eventId: string) => {
  const locationsCol = collection(db, "events", eventId, "participantLocations");
  const snapshot = await getDocs(locationsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteChatRoom = async (roomId: string) => {
  const docRef = doc(db, "chatRooms", roomId);
  await deleteDoc(docRef);
};

export const getChatMember = async (roomId: string, userId: string) => {
  const docRef = doc(db, "chatRooms", roomId, "members", userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const removeChatMember = async (roomId: string, userId: string) => {
  const docRef = doc(db, "chatRooms", roomId, "members", userId);
  await deleteDoc(docRef);
};





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
    const data = docSnapshot.data() as any;
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

export const generateChatInviteCode = async (roomId: string) => {
  const inviteCode = Math.random().toString(36).substring(2, 12);
  const docRef = doc(db, "chatRooms", roomId);
  await setDoc(docRef, { inviteCode }, { merge: true });
  return inviteCode;
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

export const updateChatMemberPin = async (roomId: string, userId: string, isPinned: boolean) => {
  const docRef = doc(db, "chatRooms", roomId, "members", userId);
  await setDoc(docRef, { isPinned }, { merge: true });
};

export const updateChatMemberRole = async (roomId: string, userId: string, role: string) => {

  const docRef = doc(db, "chatRooms", roomId, "members", userId);
  await setDoc(docRef, { role }, { merge: true });
};
export const getChatRoomByInviteCode = async (inviteCode: string) => {
  const roomsCol = collection(db, "chatRooms");
  const q = query(roomsCol, where("inviteCode", "==", inviteCode), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

export const getChatJoinRequest = async (roomId: string, userId: string) => {
  const docRef = doc(db, "chatRooms", roomId, "joinRequests", userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const createChatJoinRequest = async (roomId: string, userId: string) => {
  await setDoc(doc(db, "chatRooms", roomId, "joinRequests", userId), {
    userId,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const addReport = async (data: { messageId: string, reporterId: string, reason: string }) => {
  const reportRef = doc(collection(db, "reports"));
  await setDoc(reportRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: reportRef.id, ...data };
};

export const getReport = async (messageId: string, reporterId: string) => {
  const reportsCol = collection(db, "reports");
  const q = query(reportsCol, where("messageId", "==", messageId), where("reporterId", "==", reporterId), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const addBlock = async (blockerId: string, blockedId: string) => {
  await setDoc(doc(db, "users", blockerId, "blocks", blockedId), {
    blockedId,
    createdAt: serverTimestamp(),
  });
};

export const getBlock = async (blockerId: string, blockedId: string) => {
  const docRef = doc(db, "users", blockerId, "blocks", blockedId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};
export const removeBlock = async (blockerId: string, blockedId: string) => {
  await deleteDoc(doc(db, "users", blockerId, "blocks", blockedId));
};

export const getBlockedUsers = async (blockerId: string) => {
  const blocksCol = collection(db, "users", blockerId, "blocks");
  const snapshot = await getDocs(blocksCol);
  const blockedUsers = [];
  for (const blockDoc of snapshot.docs) {
    const blockedId = blockDoc.id;
    const userProfile = await getUserProfile(blockedId);
    blockedUsers.push({
      id: blockedId,
      name: userProfile?.name || "Unknown",
      image: userProfile?.photoUrl || null,
      blockedAt: blockDoc.data().createdAt?.toDate() || new Date(),
    });
  }
  return blockedUsers;
};

export const getChatPolls = async (roomId: string) => {
  const pollsCol = collection(db, "chatRooms", roomId, "polls");
  const q = query(pollsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const polls = [];
  for (const pollDoc of snapshot.docs) {
    const pollData = pollDoc.data();
    const votesCol = collection(db, "chatRooms", roomId, "polls", pollDoc.id, "votes");
    const votesSnapshot = await getDocs(votesCol);
    const votes = votesSnapshot.docs.map(v => v.data());
    const creator = await getUserProfile(pollData.createdById);
    polls.push({
      id: pollDoc.id,
      ...pollData,
      votes,
      createdBy: creator,
    });
  }
  return polls;
};

export const createChatPoll = async (roomId: string, data: { question: string, options: string[], createdById: string }) => {
  const pollRef = doc(collection(db, "chatRooms", roomId, "polls"));
  const pollData = {
    ...data,
    createdAt: serverTimestamp(),
  };
  await setDoc(pollRef, pollData);
  return { id: pollRef.id, ...pollData, votes: [] };
};

export const getChatPoll = async (roomId: string, pollId: string) => {
  const docRef = doc(db, "chatRooms", roomId, "polls", pollId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  
  const votesCol = collection(db, "chatRooms", roomId, "polls", pollId, "votes");
  const votesSnapshot = await getDocs(votesCol);
  const votes = votesSnapshot.docs.map(v => v.data());
  
  return { id: docSnap.id, ...docSnap.data(), votes };
};

export const voteChatPoll = async (roomId: string, pollId: string, userId: string, optionIndex: number) => {
  const voteRef = doc(db, "chatRooms", roomId, "polls", pollId, "votes", userId);
  await setDoc(voteRef, {
    userId,
    optionIndex,
    createdAt: serverTimestamp(),
  });
};

export const getChatJoinRequests = async (roomId: string) => {
  const requestsCol = collection(db, "chatRooms", roomId, "joinRequests");
  const q = query(requestsCol, where("status", "==", "pending"), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  const requests = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const userProfile = await getUserProfile(docSnap.id); // Doc ID is userId
    requests.push({
      id: docSnap.id,
      ...data,
      user: userProfile,
    });
  }
  return requests;
};

export const updateChatJoinRequestStatus = async (roomId: string, userId: string, status: "approved" | "rejected") => {
  const docRef = doc(db, "chatRooms", roomId, "joinRequests", userId);
  await setDoc(docRef, { status }, { merge: true });
};




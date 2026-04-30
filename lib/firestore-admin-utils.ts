import { getAdminDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// ── Events ────────────────────────────────────────────────────────────────────

export const getEventsByHost = async (hostId: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("events").where("host_id", "==", hostId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEventsByTeam = async (teamId: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("events").where("team_id", "==", teamId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEventBySlug = async (slug: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("events").where("slug", "==", slug).get();
  if (snapshot.empty) return null;
  const eventDoc = snapshot.docs[0];
  const eventData = { id: eventDoc.id, ...eventDoc.data() } as any;

  const participantsSnapshot = await eventDoc.ref.collection("participants").get();
  eventData.participants = participantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return eventData;
};

export const createEvent = async (eventData: any) => {
  const db = getAdminDb();
  const docRef = await db.collection("events").add({
    ...eventData,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: docRef.id, ...eventData };
};

export const updateEvent = async (eventId: string, data: any) => {
  const db = getAdminDb();
  await db.collection("events").doc(eventId).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
};

export const deleteEvent = async (eventId: string) => {
  const db = getAdminDb();
  await db.collection("events").doc(eventId).delete();
};

export const upsertParticipant = async (eventId: string, participantId: string, data: any) => {
  const db = getAdminDb();
  await db.collection("events").doc(eventId).collection("participants").doc(participantId).set({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
};

export const getParticipantByGuestName = async (eventId: string, guestName: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("events").doc(eventId).collection("participants")
    .where("guest_name", "==", guestName).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const getParticipantLocations = async (eventId: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("events").doc(eventId).collection("participantLocations").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ── Chat Rooms ────────────────────────────────────────────────────────────────

export const getChatRooms = async (userId?: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("chatRooms").get();
  const rooms = [];
  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data() as any;
    if (data.isPrivate && userId) {
      const memberDoc = await docSnapshot.ref.collection("members").doc(userId).get();
      if (!memberDoc.exists) continue;
    } else if (data.isPrivate && !userId) {
      continue;
    }
    rooms.push({ id: docSnapshot.id, ...data });
  }
  return rooms;
};

export const createChatRoom = async (roomData: any, creatorId: string) => {
  const db = getAdminDb();
  const docRef = await db.collection("chatRooms").add({
    ...roomData,
    createdById: creatorId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await docRef.collection("members").doc(creatorId).set({
    userId: creatorId,
    role: "admin",
    joinedAt: FieldValue.serverTimestamp(),
  });

  return { id: docRef.id, ...roomData };
};

export const getChatRoom = async (roomId: string) => {
  const db = getAdminDb();
  const docRef = db.collection("chatRooms").doc(roomId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;

  const membersSnapshot = await docRef.collection("members").get();
  return {
    id: docSnap.id,
    ...docSnap.data(),
    members: membersSnapshot.docs.map(d => d.data()),
  };
};

export const getChatRoomByInviteCode = async (inviteCode: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("chatRooms").where("inviteCode", "==", inviteCode).limit(1).get();
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const membersSnapshot = await docSnap.ref.collection("members").get();
  return { id: docSnap.id, ...docSnap.data(), _count: { members: membersSnapshot.size } };
};

export const generateChatInviteCode = async (roomId: string) => {
  const db = getAdminDb();
  const inviteCode = Math.random().toString(36).substring(2, 12);
  await db.collection("chatRooms").doc(roomId).set({ inviteCode }, { merge: true });
  return inviteCode;
};

export const deleteChatRoom = async (roomId: string) => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).delete();
};

// ── Chat Members ──────────────────────────────────────────────────────────────

export const getChatMember = async (roomId: string, userId: string) => {
  const db = getAdminDb();
  const docSnap = await db.collection("chatRooms").doc(roomId).collection("members").doc(userId).get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const addChatMember = async (roomId: string, userId: string, role: string = "member") => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("members").doc(userId).set({
    userId,
    role,
    joinedAt: FieldValue.serverTimestamp(),
  });
};

export const removeChatMember = async (roomId: string, userId: string) => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("members").doc(userId).delete();
};

export const updateChatMemberPin = async (roomId: string, userId: string, isPinned: boolean) => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("members").doc(userId).set({ isPinned }, { merge: true });
};

export const updateChatMemberRole = async (roomId: string, userId: string, role: string) => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("members").doc(userId).set({ role }, { merge: true });
};

// ── Chat Messages ─────────────────────────────────────────────────────────────

export const createChatMessage = async (messageData: any) => {
  const db = getAdminDb();
  const { roomId, ...rest } = messageData;
  const docRef = await db.collection("chatRooms").doc(roomId).collection("messages").add({
    ...rest,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: docRef.id, roomId, ...rest };
};

export const getChatMessages = async (roomId: string, limitCount: number = 50, cursor?: string) => {
  const db = getAdminDb();
  // Note: Avoid compound query (isDeleted + orderBy) to skip composite index requirement on server.
  // Filter isDeleted in memory instead.
  let query = db.collection("chatRooms").doc(roomId).collection("messages")
    .orderBy("createdAt", "desc")
    .limit((limitCount + 1) * 2); // fetch more to account for deleted ones

  if (cursor) {
    const cursorDoc = await db.collection("chatRooms").doc(roomId).collection("messages").doc(cursor).get();
    query = query.startAfter(cursorDoc);
  }

  const snapshot = await query.get();
  const messages = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() as any }))
    .filter(msg => !msg.isDeleted)
    .slice(0, limitCount + 1);
  return messages;
};

export const getChatMessageById = async (messageId: string) => {
  const db = getAdminDb();
  // Search across all chatRooms subcollections (collectionGroup equivalent)
  const roomsSnapshot = await db.collection("chatRooms").get();
  for (const roomDoc of roomsSnapshot.docs) {
    const msgDoc = await roomDoc.ref.collection("messages").doc(messageId).get();
    if (msgDoc.exists) {
      return { id: msgDoc.id, roomId: roomDoc.id, ...msgDoc.data() };
    }
  }
  return null;
};

export const updateChatMessage = async (roomId: string, messageId: string, data: any) => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("messages").doc(messageId).set(data, { merge: true });
};

// ── Chat Join Requests ────────────────────────────────────────────────────────

export const getChatJoinRequest = async (roomId: string, userId: string) => {
  const db = getAdminDb();
  const docSnap = await db.collection("chatRooms").doc(roomId).collection("joinRequests").doc(userId).get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const createChatJoinRequest = async (roomId: string, userId: string) => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("joinRequests").doc(userId).set({
    userId,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });
};

export const getChatJoinRequests = async (roomId: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("chatRooms").doc(roomId).collection("joinRequests")
    .where("status", "==", "pending").get();
  const requests = [];
  for (const docSnap of snapshot.docs) {
    const userProfile = await getUserProfile(docSnap.id);
    requests.push({ id: docSnap.id, ...docSnap.data(), user: userProfile });
  }
  return requests;
};

export const updateChatJoinRequestStatus = async (roomId: string, userId: string, status: "approved" | "rejected") => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("joinRequests").doc(userId).set({ status }, { merge: true });
};

// ── Chat Polls ────────────────────────────────────────────────────────────────

export const getChatPolls = async (roomId: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("chatRooms").doc(roomId).collection("polls")
    .orderBy("createdAt", "desc").get();
  const polls = [];
  for (const pollDoc of snapshot.docs) {
    const pollData = pollDoc.data();
    const votesSnapshot = await pollDoc.ref.collection("votes").get();
    const votes = votesSnapshot.docs.map(v => v.data());
    const creator = await getUserProfile(pollData.createdById);
    polls.push({ id: pollDoc.id, ...pollData, votes, createdBy: creator });
  }
  return polls;
};

export const createChatPoll = async (roomId: string, data: { question: string; options: string[]; createdById: string }) => {
  const db = getAdminDb();
  const pollRef = db.collection("chatRooms").doc(roomId).collection("polls").doc();
  const pollData = { ...data, createdAt: FieldValue.serverTimestamp() };
  await pollRef.set(pollData);
  return { id: pollRef.id, ...pollData, votes: [] };
};

export const getChatPoll = async (roomId: string, pollId: string) => {
  const db = getAdminDb();
  const docSnap = await db.collection("chatRooms").doc(roomId).collection("polls").doc(pollId).get();
  if (!docSnap.exists) return null;
  const votesSnapshot = await docSnap.ref.collection("votes").get();
  return { id: docSnap.id, roomId, ...docSnap.data(), votes: votesSnapshot.docs.map(v => v.data()) };
};

export const voteChatPoll = async (roomId: string, pollId: string, userId: string, optionIndex: number) => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("polls").doc(pollId).collection("votes").doc(userId).set({
    userId,
    optionIndex,
    createdAt: FieldValue.serverTimestamp(),
  });
};

export const getChatPollById = async (pollId: string) => {
  const db = getAdminDb();
  const roomsSnapshot = await db.collection("chatRooms").get();
  for (const roomDoc of roomsSnapshot.docs) {
    const pollDoc = await roomDoc.ref.collection("polls").doc(pollId).get();
    if (pollDoc.exists) {
      return { id: pollDoc.id, roomId: roomDoc.id, ...pollDoc.data() };
    }
  }
  return null;
};

export const updateChatPollStatus = async (roomId: string, pollId: string, isFinalized: boolean) => {
  const db = getAdminDb();
  await db.collection("chatRooms").doc(roomId).collection("polls").doc(pollId).set({ isFinalized }, { merge: true });
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUserProfile = async (userId: string) => {
  const db = getAdminDb();
  const docSnap = await db.collection("users").doc(userId).get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const updateUserProfile = async (userId: string, data: any) => {
  const db = getAdminDb();
  await db.collection("users").doc(userId).set({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return data;
};

// ── Reports & Blocks ──────────────────────────────────────────────────────────

export const addReport = async (data: { messageId: string; reporterId: string; reason: string }) => {
  const db = getAdminDb();
  const docRef = db.collection("reports").doc();
  await docRef.set({ ...data, createdAt: FieldValue.serverTimestamp() });
  return { id: docRef.id, ...data };
};

export const getReport = async (messageId: string, reporterId: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("reports")
    .where("messageId", "==", messageId)
    .where("reporterId", "==", reporterId)
    .limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const addBlock = async (blockerId: string, blockedId: string) => {
  const db = getAdminDb();
  await db.collection("users").doc(blockerId).collection("blocks").doc(blockedId).set({
    blockedId,
    createdAt: FieldValue.serverTimestamp(),
  });
};

export const getBlock = async (blockerId: string, blockedId: string) => {
  const db = getAdminDb();
  const docSnap = await db.collection("users").doc(blockerId).collection("blocks").doc(blockedId).get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const removeBlock = async (blockerId: string, blockedId: string) => {
  const db = getAdminDb();
  await db.collection("users").doc(blockerId).collection("blocks").doc(blockedId).delete();
};

export const getBlockedUsers = async (blockerId: string) => {
  const db = getAdminDb();
  const snapshot = await db.collection("users").doc(blockerId).collection("blocks").get();
  const blockedUsers = [];
  for (const blockDoc of snapshot.docs) {
    const blockedId = blockDoc.id;
    const userProfile = await getUserProfile(blockedId) as any;
    blockedUsers.push({
      id: blockedId,
      name: userProfile?.name || "Unknown",
      image: userProfile?.photoUrl || null,
      blockedAt: blockDoc.data().createdAt?.toDate() || new Date(),
    });
  }
  return blockedUsers;
};

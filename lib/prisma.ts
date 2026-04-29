// Dummy Prisma Client to satisfy build after migration to Firebase
// This file should be removed once all routes are fully migrated to Firestore.

const mockPrisma = new Proxy({}, {
  get: () => {
    const handler = {
      get: () => handler,
      apply: () => Promise.resolve(null),
    };
    return new Proxy(() => {}, handler);
  }
}) as any;

export const prisma = mockPrisma;
export default mockPrisma;

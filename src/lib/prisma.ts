import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  if (process.env.DATABASE_URL?.startsWith("file:")) {
    // Force absolute path for SQLite on Vercel
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL.replace("file:./", `file:${process.cwd()}/prisma/`)
        }
      }
    });
  }
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

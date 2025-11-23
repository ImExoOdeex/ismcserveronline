import { PrismaClient } from "@prisma/client";
import { Logger } from "../modules/Logger";
import { redisCacheMiddleware } from "./PrismaRedisCacheMiddleware";

// export let db: PrismaClient;

class PrismaClientWithCache extends PrismaClient {
  constructor() {
    super();
    Logger("Prisma initialized", "green");
    this.$use(redisCacheMiddleware);
  }
}

declare global {
  var __db: PrismaClient | undefined;
}

if (!global.__db) {
  global.__db = new PrismaClientWithCache();
}
export const db = global.__db;

const actions = [
  // "beforeExit",
  // "exit",
  // "uncaughtException",
  "SIGINT",
  "SIGTERM",
] as const;
for (const action of actions) {
  process.on(action, async () => {
    await db.$disconnect().catch((e) => {
      console.log("F  A  I  L  E  D  T  O  D  I  S  C  O  N  N  E  C  T");
      console.error(e);
    });
    console.log("PrismaClient disconnected");
  });
}

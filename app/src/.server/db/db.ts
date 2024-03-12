import { PrismaClient } from "@prisma/client";
import { PrismaClientWithCache } from "server/databases/postgresql";

export let db: PrismaClient;

declare global {
	var __db: PrismaClient | undefined;
}

// if (process.env.NODE_ENV === "production" || serverConfig.reconnectEverytimeDbInDev) {
// 	console.log("[Prisma] Connecting to Postgresql | Production");
// 	db = new PrismaClientWithCache();
// } else {
// this to not crete milion connections in dev mode, cus they create on fast refresh
if (!global.__db) {
	console.log(`[Prisma] Connecting to Postgresql | ${process.env.NODE_ENV}`);
	global.__db = new PrismaClientWithCache();
}
db = global.__db;
// }

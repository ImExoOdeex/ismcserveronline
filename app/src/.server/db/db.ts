import serverConfig from "@/.server/serverConfig";
import { PrismaClient } from "@prisma/client";
import { redisCacheMiddleware } from "./PrismaRedisCacheMiddleware";

export let db: PrismaClient;

declare global {
	var __db: PrismaClient | undefined;
}

class PrismaClientWithCache extends PrismaClient {
	constructor() {
		super();
		this.$use(redisCacheMiddleware);
	}
}

if (process.env.NODE_ENV === "production" || serverConfig.reconnectEverytimeDbInDev) {
	console.log("[Prisma] Connecting to Postgresql | Production");
	db = new PrismaClientWithCache();
} else {
	// this to not crete milion connections in dev mode, cus they create on fast refresh
	if (!global.__db) {
		console.log("[Prisma] Connecting to Postgresql | Development");
		global.__db = new PrismaClientWithCache();
	}
	db = global.__db;
}

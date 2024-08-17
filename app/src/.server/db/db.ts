import { PrismaClient } from "@prisma/client";
import { redisCacheMiddleware } from "./PrismaRedisCacheMiddleware";

// export let db: PrismaClient;

class PrismaClientWithCache extends PrismaClient {
    constructor() {
        super();
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

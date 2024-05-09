import { redisCacheMiddleware } from "@/.server/db/PrismaRedisCacheMiddleware";
import { PrismaClient } from "@prisma/client";

export let db: PrismaClient;

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
db = global.__db;

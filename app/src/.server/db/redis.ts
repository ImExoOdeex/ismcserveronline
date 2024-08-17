import { Redis, type RedisOptions } from "ioredis";
import { requireEnv } from "../functions/env.server";

declare global {
    var __redis: Redis | undefined;
}

const options = {
    host: requireEnv("REDIS_HOST"),
    password: requireEnv("REDIS_PASSWORD"),
    db: Number(requireEnv("REDIS_DB")),
    maxRetriesPerRequest: 3,
    lazyConnect: true
} as RedisOptions;

// ttl = time to live = 60 * 60 * 24 = 1 day
export default class cache {
    static redis =
        global.__redis ??
        (() => {
            const createdRedis = new Redis(options);
            global.__redis = createdRedis;
            return createdRedis;
        })();

    static async set(key: string, value: string | object | number, ttl: number = 60 * 60 * 24) {
        cache.redis.set(
            key,
            typeof value === "object"
                ? JSON.stringify(value)
                : typeof value === "number"
                  ? value.toString()
                  : value,
            "EX",
            ttl
        );
    }

    static async get(key: string) {
        return await cache.redis.get(key);
    }

    static async delete(key: string) {
        return await cache.redis.del(key);
    }

    static async flush() {
        return await cache.redis.flushdb();
    }

    static async connect() {
        return await cache.redis.connect();
    }
}

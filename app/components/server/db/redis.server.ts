import { Redis, type RedisOptions } from "ioredis";
import invariant from "tiny-invariant";

export let redis: Redis;

declare global {
	var __redis: Redis | undefined;
}

invariant(process.env.REDIS_HOST, "REDIS_HOST is not defined");
// invariant(process.env.REDIS_PASSWORD, "REDIS_PASSWORD is not defined");
invariant(process.env.REDIS_DB, "REDIS_DB is not defined");

const options = {
	host: process.env.REDIS_HOST,
	password: process.env.REDIS_PASSWORD,
	db: Number(process.env.REDIS_DB),
	maxRetriesPerRequest: 3
} as RedisOptions;

if (process.env.NODE_ENV === "production") {
	redis = new Redis(options);
} else {
	if (!global.__redis) {
		global.__redis = new Redis(options);
	}
	redis = global.__redis;
}

// ttl = time to live = 60 * 60 * 24 = 1 day
export async function setCache(key: string, value: string | object | number, ttl: number = 60 * 60 * 24) {
	await redis.set(
		key,
		typeof value === "object" ? JSON.stringify(value) : typeof value === "number" ? value.toString() : value,
		"EX",
		ttl
	);
}

export async function getCache(key: string) {
	return await redis.get(key);
}

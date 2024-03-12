import { requireEnv } from "@/.server/functions/env.server";
import "dotenv/config";
import { Redis, RedisOptions } from "ioredis";

const options = {
	host: requireEnv("REDIS_HOST"),
	password: requireEnv("REDIS_PASSWORD"),
	db: Number(requireEnv("REDIS_DB")),
	maxRetriesPerRequest: 3,
	lazyConnect: true
} as RedisOptions;

export class RedisInstance extends Redis {
	constructor() {
		super(options);
	}
}

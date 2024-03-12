import { redisCacheMiddleware } from "@/.server/db/PrismaRedisCacheMiddleware";
import { PrismaClient } from "@prisma/client";

export class PrismaClientWithCache extends PrismaClient {
	constructor() {
		super();
		this.$use(redisCacheMiddleware);
	}
}

import { Prisma } from "@prisma/client";
import { copyObjectWithoutKeys, isObject } from "../../functions/utils";
import redisCache from "./redis";

type Result = Record<string, unknown>;
type Params = Prisma.MiddlewareParams;
type Action = Prisma.PrismaAction;
type ModelName = Prisma.ModelName;

interface AllowedModelConfig<T extends ModelName = ModelName, K extends string[] = string[]> {
    model: T;
    fields: K;
    uniqueFields: Partial<K>;
}

const enabled = process.env.DISABLE_REDIS_CACHE !== "true";
const loggingEnabled = process.env.REDIS_CACHE_LOGGING === "true";

function logger(...args: any[]) {
    if (!loggingEnabled) return;
    console.log("[Redis Cache Middleware]", ...args);
}

const config = [
    {
        model: "User",
        fields: Object.keys(Prisma.UserScalarFieldEnum),
        uniqueFields: ["id", "email"]
    },
    {
        model: "Server",
        fields: Object.keys(Prisma.ServerScalarFieldEnum),
        uniqueFields: ["id"]
    },
    {
        model: "Token",
        fields: Object.keys(Prisma.TokenScalarFieldEnum),
        uniqueFields: ["id", "token"]
    },
    {
        model: "Vote",
        fields: Object.keys(Prisma.VoteScalarFieldEnum),
        uniqueFields: ["id"]
    }
] satisfies AllowedModelConfig[];

function isUniqueAction(action: Action): action is "findUnique" {
    return action === "findUnique";
}

function getCacheKey(params: Params, queryType = "uq") {
    const where = params.args?.where as Record<string, unknown> | undefined;
    if (!where) return null;

    // Construct cache key based on query type
    let cacheKey = `${params.model}-${queryType}`;

    // Add properties from where object to cache key
    Object.keys(where).forEach((key) => {
        cacheKey += `-${key}-${
            where[key] instanceof Object ? JSON.stringify(where[key]) : where[key]
        }`;
    });

    return cacheKey;
}

function checkIfCacheHasAllFields<T>(
    cache: Result | null,
    select: Record<string, boolean>
): cache is Required<T> {
    if (!cache) return false;
    // logger("cache", cache);
    logger("select", select);
    try {
        return Object.keys(select).every((key) => {
            if (key in cache) return true;
        });
    } catch (e) {
        console.error("Error checking if cache has all fields:", e);
        return false;
    }
}

export async function redisCacheMiddleware<T = Result>(
    params: Params,
    next: (params: Params) => Promise<T>
): Promise<T> {
    let result: T;

    async function goOn() {
        return next(params);
    }

    if (!enabled) {
        logger("Redis cache is disabled, proceeding with the next middleware");
        return goOn();
    }

    // If the model is not specified in the params, proceed with the next middleware
    if (!params.model) {
        logger("Model not specified, proceeding with the next middleware");
        return goOn();
    }

    // Find the model configuration from the config object
    const modelConfig = config.find((item) => item.model === params.model);

    // If the model is not found in the config, proceed with the next middleware
    if (!modelConfig) {
        logger("Model not found in config`, proceeding with the next middleware");
        return goOn();
    }

    const action = params.action;
    const queryActions = ["findFirst", "findMany", "findUnique", "findRaw", "count"] as Action[];
    const isMutation = !queryActions.includes(action);

    // If it's a mutation, execute the mutation and handle caching accordingly
    if (isMutation) {
        const res = (await goOn()) as any;
        // logger("Mutation executed, caching result:", res);
        const cacheKey = getCacheKey(params, "uq");

        // const cacheKeys

        if (cacheKey) {
            const oldCache = await redisCache.get(cacheKey);
            const oldCacheParsed = (oldCache ? JSON.parse(oldCache) : {}) as Partial<T>;

            const newCache = { ...oldCacheParsed, ...res };

            // set unique cache fields. so like when user is updated, all inuqie cache fields are set to new value
            const newCacheKeys = Object.keys(newCache);
            for (const key of newCacheKeys) {
                // Only consider fields specified as unique in the model's configuration
                if (!modelConfig.uniqueFields.includes(key)) continue;

                const value = (newCache as Record<string, string | number>)[key];
                if (
                    Array.isArray(value) ||
                    isObject(value) ||
                    typeof value === "boolean" ||
                    typeof value === "undefined" ||
                    typeof value === "function" ||
                    typeof value === "object"
                )
                    continue;

                const oneCacheKey = getCacheKey({
                    ...params,
                    args: {
                        where: {
                            [key]: value
                        }
                    }
                });
                if (!oneCacheKey) continue;

                await redisCache.set(oneCacheKey, JSON.stringify(newCache));
                logger("Setting cache for unique query:", oneCacheKey);
            }

            // delete find first server cache
            const cacheKeyFF = getCacheKey(
                {
                    ...params,
                    args: {
                        where: {
                            server: res.server,
                            bedrock: res.bedrock
                        }
                    }
                },
                "ff"
            );
            if (cacheKeyFF) {
                logger("Setting cache for findFirst query:", cacheKeyFF);
                await redisCache.set(cacheKeyFF, newCache);
            }
        }

        return res;
    }

    // Check if it's a findFirst query
    if (action === "findFirst") {
        // Generate cache key for findFirst query
        const cacheKey = getCacheKey(params, "ff");
        // logger("Cache key for findFirst:", cacheKey);

        if (cacheKey) {
            logger("Cache key found for findFirst, checking if cache has all fields");
            // Check if cache has all fields
            const select = (params.args?.select ||
                modelConfig.fields.reduce((acc, key) => {
                    (acc as Record<string, boolean>)[key] = true;
                    return acc;
                }, {})) as Record<string, boolean>;
            const cacheRaw = await redisCache.get(cacheKey);
            const cache = cacheRaw ? (JSON.parse(cacheRaw) as T) : null;
            const cacheHasAllFields = checkIfCacheHasAllFields<T>(cache as Required<T>, select);
            logger("Cache has all fields:", cacheHasAllFields);

            if (cacheHasAllFields) {
                logger("Cache hit - returning cached result for findFirst:", cacheKey);
                return cache as T;
            }
                logger(
                    "Cache miss or partial cache for findFirst - executing query and caching result:",
                    cacheKey
                );
                logger("Result Cache:", cache && copyObjectWithoutKeys(cache, ["favicon"] as any));
                result = await goOn();
                await redisCache.set(cacheKey, JSON.stringify(result));
                return result;
        }
        logger("Cache key not found for findFirst, proceeding with the next middleware");
        return goOn();
    }

    // If it's not a mutation or findFirst query, proceed with caching for unique queries
    if (!isUniqueAction(action)) {
        logger("Not a unique action or findFirst, proceeding with the next middleware");
        return goOn();
    }

    const select = (params.args?.select ||
        modelConfig.fields.reduce((acc, key) => {
            (acc as Record<string, boolean>)[key] = true;
            return acc;
        }, {})) as Record<string, boolean>;

    const cacheKey = getCacheKey(params);
    if (!cacheKey) {
        logger("Cache key not found, proceeding with the next middleware");
        return goOn();
    }
    const cacheRaw = await redisCache.get(cacheKey);
    const cache = cacheRaw ? (JSON.parse(cacheRaw) as Partial<T>) : null;
    const cacheHasAllFields = checkIfCacheHasAllFields<T>(cache, select);

    // If cache has all fields, return the cached result
    if (cacheHasAllFields) {
        logger("Cache hit - returning cached result:", cacheKey);
        result = cache;
    } else {
        // If cache miss or partial cache, execute the query and cache the result
        logger("Cache miss or partial cache - executing query and caching result:", cacheKey);
        result = await goOn();
        await redisCache.set(cacheKey, JSON.stringify(result));
    }

    return result;
}

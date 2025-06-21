import logger from "../logger/index.js";
import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../utils/mainUtils.js";

let redisClient;

export const redisInit = async () => {
    try {
        redisClient = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        lazyConnect: true,
        retryStrategy: (times) => {
            const delay = Math.min(times * 100, 3000);
            logger.warn(`🔄 Redis reconnecting in ${delay}ms (attempt: ${times})`);
            return delay;
        },
        });

        redisClient.on("connect", () => {
        logger.info(`✅ Redis Connected on ${REDIS_HOST}:${REDIS_PORT}`);
        });

        redisClient.on("error", (err) => {
        logger.error("❌ Redis Connection Failed:", err);
        });

        await redisClient.connect();
    } catch (error) {
        logger.error("❌ Redis Initialization Error:", error);
    }
};

export const getRedisClient = async () => {
    if (!redisClient || redisClient.status !== "ready") {
        logger.warn("⏳ Redis client not ready. Initializing...");
        await redisInit();
    }
    return redisClient;
};

redisInit();

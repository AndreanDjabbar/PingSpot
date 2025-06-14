import "../src/config/envConfig.js";
import app from "./app.js";
import logger from "./logger/index.js";
import { PORT, HOST, NODE_ENV } from "./utils/mainUtils.js";

const start = async () => {
    try {
        await app.listen({ port: PORT, host: HOST });
        logger.info(`Server started in ${NODE_ENV.toUpperCase()} mode`);
        logger.info(`Server running at http://${HOST}:${PORT}`);
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
};

start();
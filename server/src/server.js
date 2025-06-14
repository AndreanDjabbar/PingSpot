import "../src/config/envConfig.js";
import app from "./app.js";
import logger from "./logger/index.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

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
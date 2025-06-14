import logger from "../logger/index.js";
import { 
    responseError, 
    responseSuccess,
    GITHUB_REPO_URL 
} from "../utils/mainUtils.js";

export const defaultController = (request, reply) => {
    logger.info("DEFAULT CONTROLLER");
    return responseSuccess(reply, 200, "Welcome to Pingspot API", "data", {
        message: "Welcome to Pingspot API.. Please check the repository for more information.",
        repository: GITHUB_REPO_URL
    });
}
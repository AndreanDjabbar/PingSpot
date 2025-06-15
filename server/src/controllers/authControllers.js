import { responseSuccess, responseError } from "../utils/mainUtils.js";
import logger from "../logger/index.js";

export const loginController = async (request, reply) => {
    logger.info("LOGIN CONTROLLER");
    const { email, password } = request.body || {};
    try {
        return responseSuccess(reply, 200, "Login Berhasil", "data", {
            message: "Login Berhasil",
            user: {
                email: email
            }
        });
    } catch (error) {
        logger.error("Login error:", error);
        responseError(reply, 500, "Internal server error", "error", error.message || "An unexpected error occurred");
    }
}
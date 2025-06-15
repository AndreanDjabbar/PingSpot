import { 
    responseSuccess, 
    responseError, 
    hashPassword, 
    comparePassword 
} from "../utils/mainUtils.js";
import { 
    registerService
} from "../services/authServices.js";
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

export const registerController = async (request, reply) => {
  logger.info("REGISTER CONTROLLER");

  const {
    username,
    email,
    password,
    fullName,
    phone,
    provider = 'EMAIL',
    providerId = null
  } = request.body || {};

  try {
    const hashedPassword = provider === 'EMAIL' ? await hashPassword(password) : null;

    const newUser = await registerService({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      provider,
      providerId
    });

    if (!newUser) {
      return responseError(reply, 400, "Registrasi gagal", "error", "Terjadi kesalahan saat registrasi");
    }

    return responseSuccess(reply, 201, "Registrasi Berhasil", "data", {
      message: "Registrasi Berhasil",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        provider: newUser.provider
      }
    });
  } catch (error) {
    logger.error("Registration error:", error);
    return responseError(reply, 500, "Internal server error", "error", error.message || "Unexpected error");
  }
};
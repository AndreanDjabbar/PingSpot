import { 
    responseSuccess, 
    responseError, 
    hashPassword, 
    comparePassword,
    generateRandomCode,
    sendEmail,
    CLIENT_URL
} from "../utils/mainUtils.js";
import { 
    registerService
} from "../services/authServices.js";
import logger from "../logger/index.js";
import { getRedisClient } from "../config/redisConfig.js";

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
        logger.error({ err: error }, "Login error");
        responseError(reply, error.statusCode || 500, "Internal server error", "error", error.message || "An unexpected error occurred");
    }
};

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

    const [newUser, err] = await registerService({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      provider,
      providerId
    });

    if (!newUser || err) {
      return responseError(reply, err.statusCode || 400, "Registrasi gagal", "error", err.message || "Registrasi gagal, silakan coba lagi");
    }

    const randomLink1 = generateRandomCode(150);
    const randomLink2 = generateRandomCode(150);
    const redisClient = await getRedisClient();
    await redisClient.set(`link:${newUser.id}`, JSON.stringify({
      link1: randomLink1,
      link2: randomLink2
    }), 'EX', 300);

    const verificationLink = `${CLIENT_URL}/auth/verify-register/${randomLink1}/${newUser.id}/${randomLink2}`;

    sendEmail(newUser.email, "register_validation", verificationLink)
      .then(() => logger.info(`✅ Verification email sent to ${newUser.email}`))
      .catch((err) => logger.error({ err }, "❌ Failed to send verification email"));

    return responseSuccess(reply, 201, "Registrasi Berhasil! Silahkan cek email anda untuk verifikasi akun", "data", {
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
    logger.error({ err: error }, "Registration error");
    return responseError(reply, error.statusCode || 500, "Internal server error", "error", error.message || "Unexpected error");
  }
};
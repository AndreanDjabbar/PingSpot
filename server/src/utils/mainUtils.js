export const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL || "";
export const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info';
export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || "0.0.0.0";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
export const REDIS_HOST = process.env.REDIS_HOST || "localhost";
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
import bcrypt from 'bcrypt';

export const responseSuccess = (reply, status = 200, message = "Success", key = null, data = null) => {
    if (key === null || key === undefined) {
        key = "data";
    }
    return reply.code(status).send({
        success: true,
        message: message,
        [key]: data,
    });
};

export const responseError = (reply, status = 400, message, key = null, error = null) => {
    if (key === null || key === undefined) {
        key = "error";
    }
    return reply.code(status).send({
        success: false,
        message: message,
        [key]: error,
    });
};

export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error("Error hashing password: " + error.message);
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error("Error comparing password: " + error.message);
    }
}
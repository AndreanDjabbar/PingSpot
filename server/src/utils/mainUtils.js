export const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL || "";
export const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info';
export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || "0.0.0.0";
export const NODE_ENV = process.env.NODE_ENV || "development";

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
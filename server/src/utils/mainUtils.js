export const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL || "";

export const responseSuccess = (reply, status = 200, message = "Success", key = "data", data = null) => {
    return reply.code(status).send({
        success: true,
        message: message,
        [key]: data,
    });
};

export const responseError = (reply, status = 400, message = "Error", key = "error", error = null) => {
    return reply.code(status).send({
        success: false,
        message: message,
        [key]: error,
    });
};
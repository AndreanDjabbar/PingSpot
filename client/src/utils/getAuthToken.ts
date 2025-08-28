const getAuthToken = (): string | null => {
    if (typeof document === "undefined") {
        return null;
    }

    try {
        const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

        return token || null;
    } catch {
        return null;
    }
};

export default getAuthToken;
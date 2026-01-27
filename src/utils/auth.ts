import { jwtDecode } from "jwt-decode"

export const getJWTExpired = (jwt = getAuthToken()): number => {
    if (!jwt) return 0;

    try {
        const decodedJWT = jwtDecode<{ exp: number }>(jwt);
        const exp = decodedJWT.exp;

        if (typeof exp !== "number") {
        throw new Error("Invalid JWT: 'exp' field is not a number.");
        }

        return exp * 1000;
    } catch {
        return 0;
    }
};

export const getAuthToken = (): string | null => {
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
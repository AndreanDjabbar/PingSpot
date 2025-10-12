import { jwtDecode } from "jwt-decode"
import { getAuthToken } from "./getAuthToken";

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
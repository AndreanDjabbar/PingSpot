import { jwtDecode } from "jwt-decode"
import getAuthToken from "./getAuthToken";

const getJWTExpired = (jwt=getAuthToken()): number => {
    const decodedJWT = jwtDecode<{ exp: number }>(jwt || "");
    const exp = decodedJWT.exp;
    if (typeof exp !== 'number') {
        throw new Error("Invalid JWT: 'exp' field is not a number.");
    }
    const expirationDate = exp * 1000;
    return expirationDate
}

export default getJWTExpired;
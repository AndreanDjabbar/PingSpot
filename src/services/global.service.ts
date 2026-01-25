import { IReverseLocation, IReverseLocationRequest } from "@/types";
import axios from "axios";

const REVERSE_LOCATION_API_URL = `${process.env.NEXT_PUBLIC_REVERSE_LOCATION_URL}`;

export const reverseCurrentLocationService = async (payload: IReverseLocationRequest): 
Promise<IReverseLocation> => {
    const response = await axios.get<IReverseLocation>(`${REVERSE_LOCATION_API_URL}?lat=${payload.latitude}&lon=${payload.longitude}&format=json`);
    return response.data;
};
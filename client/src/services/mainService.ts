import axios from "axios";
import { IReverseLocationType } from "@/app/main/types";

type IResponseType = {
    message: string;
    data?: unknown;
}

const REVERSE_LOCATION_API_URL = `${process.env.NEXT_PUBLIC_REVERSE_LOCATION_URL}`;

export const reverseCurrentLocationService = async (payload: IReverseLocationType): 
Promise<IResponseType> => {
    const response = await axios.get<IResponseType>(`${REVERSE_LOCATION_API_URL}?lat=${payload.latitude}&lon=${payload.longitude}&format=json`);
    return response.data;
};
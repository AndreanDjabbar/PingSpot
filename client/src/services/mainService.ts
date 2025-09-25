import axios from "axios";
import { IReverseLocationType } from "@/types/mainTypes";
import getAuthToken from "@/utils/getAuthToken";

type IResponseType = {
    message: string;
    data?: unknown;
}

const REVERSE_LOCATION_API_URL = `${process.env.NEXT_PUBLIC_REVERSE_LOCATION_URL}`;
const MAIN_API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

// const COMMON_HEADERS = (authToken: string) => {
//     return {
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${authToken}`
//         }
//     }
// }

const MULTIPART_HEADERS = (authToken: string) => {
    return {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    }
}

export const reverseCurrentLocationService = async (payload: IReverseLocationType): 
Promise<IResponseType> => {
    const response = await axios.get<IResponseType>(`${REVERSE_LOCATION_API_URL}?lat=${payload.latitude}&lon=${payload.longitude}&format=json`);
    return response.data;
};

export const createReportService = async (payload: FormData): Promise<IResponseType> => {
    const authToken = getAuthToken();
    const response = await axios.post<IResponseType>(`${MAIN_API_URL}/report`, payload, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const getReportService = async (): Promise<IResponseType> => {
    const authToken = getAuthToken();
    const response = await axios.get<IResponseType>(`${MAIN_API_URL}/report`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
        }
    });
    return response.data;
}

export const getReportByIDService = async (reportID: number): Promise<IResponseType> => {
    const authToken = getAuthToken();
    const response = await axios.get<IResponseType>(`${MAIN_API_URL}/report?reportID=${reportID}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
        }
    });
    return response.data;
}
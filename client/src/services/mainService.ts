import axios from "axios";
import { 
    ICreateReportResponse,
    IGetReportResponse,
    IReactReportResponse 
} from "@/types/response/mainTypes";
import getAuthToken from "@/utils/getAuthToken";
import { IReactReportFormType } from "@/app/main/schema";
import { ReverseLocation } from "@/types/entity/mainTypes";

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

export const reverseCurrentLocationService = async (payload: ReverseLocation): 
Promise<IResponseType> => {
    const response = await axios.get<IResponseType>(`${REVERSE_LOCATION_API_URL}?lat=${payload.latitude}&lon=${payload.longitude}&format=json`);
    return response.data;
};

export const createReportService = async (payload: FormData): Promise<ICreateReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<ICreateReportResponse>(`${MAIN_API_URL}/report`, payload, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const getReportService = async (): Promise<IGetReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.get<IGetReportResponse>(`${MAIN_API_URL}/report`, {
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

export const reactReportService = async (reportID: number, data: IReactReportFormType): Promise<IReactReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<IReactReportResponse>(`${MAIN_API_URL}/report/${reportID}/reaction`, 
        { reactionType: data.reactionType }, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}
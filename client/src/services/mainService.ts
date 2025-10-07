import axios from "axios";
import { 
    ICreateReportResponse,
    IGetReportResponse,
    IReactReportRequest,
    IReactReportResponse,
    IUpdateReportStatusResponse,
    IUploadProgressReportResponse
} from "@/types/api/report";
import { IReverseLocationResponse, IReverseLocationRequest } from "@/types/api/user";
import getAuthToken from "@/utils/getAuthToken";

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

export const reverseCurrentLocationService = async (payload: IReverseLocationRequest): 
Promise<IReverseLocationResponse> => {
    const response = await axios.get<IReverseLocationResponse>(`${REVERSE_LOCATION_API_URL}?lat=${payload.latitude}&lon=${payload.longitude}&format=json`);
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

// export const getReportByIDService = async (reportID: number): Promise<IResponseType> => {
//     const authToken = getAuthToken();
//     const response = await axios.get<IResponseType>(`${MAIN_API_URL}/report?reportID=${reportID}`, {
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${authToken || ''}`
//         }
//     });
//     return response.data;
// }

export const reactReportService = async (reportID: number, data: IReactReportRequest): Promise<IReactReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<IReactReportResponse>(`${MAIN_API_URL}/report/${reportID}/reaction`, 
        { reactionType: data.reactionType }, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const uploadProgressReportService = async (reportID: number, payload: FormData): Promise<IUploadProgressReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<IUploadProgressReportResponse>(`${MAIN_API_URL}/report/${reportID}/progress`, payload, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const updateReportStatusService = async (reportID: number, status: string): Promise<IUpdateReportStatusResponse> => {
    const authToken = getAuthToken();
    const response = await axios.patch(`${MAIN_API_URL}/report/${reportID}/status`, 
        { status }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
        }
    });
    return response.data;
}
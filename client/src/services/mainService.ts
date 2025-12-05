import axios from "axios";
import { 
    ICreateReportCommentResponse,
    ICreateReportResponse,
    IDeleteReportRequest,
    IDeleteReportResponse,
    IEditReportResponse,
    IGetProgressReportResponse,
    IGetReportByIDResponse,
    IGetReportCommentsResponse,
    IGetReportResponse,
    IReactReportRequest,
    IReactReportResponse,
    IUpdateReportStatusResponse,
    IUploadProgressReportResponse,
    IVoteReportRequest,
    IVoteReportResponse
} from "@/types/api/report";
import { IReverseLocationRequest } from "@/types/api/user";
import { getAuthToken } from "@/utils";
import { IReverseLocation } from "@/types/model/user";

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
Promise<IReverseLocation> => {
    const response = await axios.get<IReverseLocation>(`${REVERSE_LOCATION_API_URL}?lat=${payload.latitude}&lon=${payload.longitude}&format=json`);
    return response.data;
};

export const createReportService = async (payload: FormData): Promise<ICreateReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<ICreateReportResponse>(`${MAIN_API_URL}/report`, payload, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const getReportByIDService = async (reportID: number): Promise<IGetReportByIDResponse> => {
    const authToken = getAuthToken();
    const response = await axios.get<IGetReportByIDResponse>(`${MAIN_API_URL}/report?reportID=${reportID}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
        }
    });
    return response.data;
}

export const getReportService = async (
    cursorID?: number,
    reportType?: string,
    status?: string,
    sortBy?: string,
    distance?: { distance: string; lat: string | null; lng: string | null },
    hasProgress?: string
): Promise<IGetReportResponse> => {
    const authToken = getAuthToken();
    const params = new URLSearchParams();

    if (cursorID) params.append('cursorID', cursorID.toString());
    if (reportType && reportType !== 'all') params.append('reportType', reportType);
    if (status && status !== 'all') params.append('status', status);
    if (distance && distance.distance !== 'all' && distance.lat !== null && distance.lng !== null) {
        const distanceOBJ = {
            distance: distance.distance,
            lat: distance.lat,
            lng: distance.lng
        }
        const distanceSTR = JSON.stringify(distanceOBJ)
        params.append("distance", distanceSTR)
    }
    if (sortBy) params.append('sortBy', sortBy);
    if (hasProgress && hasProgress !== 'all') params.append('hasProgress', hasProgress);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await axios.get<IGetReportResponse>(`${MAIN_API_URL}/report${queryString}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
        }
    });
    return response.data;
}

export const getReportCommentsService = async (
    cursorID?: number,
    reportID?: number,
): Promise<IGetReportCommentsResponse> => {
    const authToken = getAuthToken();
    const params = new URLSearchParams();

    if (cursorID) params.append('cursorID', cursorID.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await axios.get<IGetReportCommentsResponse>(`${MAIN_API_URL}/report/${reportID}/comment/${queryString}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
        }
    });
    return response.data;
}

export const getProgressReportService = async (reportID: number): Promise<IGetProgressReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.get<IGetProgressReportResponse>(`${MAIN_API_URL}/report/${reportID}/progress`, {
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

export const voteReportService = async (reportID: number, data: IVoteReportRequest): Promise<IVoteReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<IVoteReportResponse>(`${MAIN_API_URL}/report/${reportID}/vote`, 
        { voteType: data.voteType }, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const uploadProgressReportService = async (reportID: number, payload: FormData): Promise<IUploadProgressReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<IUploadProgressReportResponse>(`${MAIN_API_URL}/report/${reportID}/progress`, payload, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const createReportCommentService = async (reportID: number, payload: FormData): Promise<ICreateReportCommentResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<ICreateReportCommentResponse>(`${MAIN_API_URL}/report/${reportID}/comment`, payload, MULTIPART_HEADERS(authToken || ''));
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

export const EditReportService = async (reportID: number, payload: FormData): Promise<IEditReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.put<IEditReportResponse>(`${MAIN_API_URL}/report/${reportID}`, payload, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const DeleteReportService = async (payload: IDeleteReportRequest): Promise<IDeleteReportResponse> => {
    const authToken = getAuthToken();
    const response = await axios.delete<IDeleteReportResponse>(`${MAIN_API_URL}/report/${payload.reportID}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
        }
    });
    return response.data;
}
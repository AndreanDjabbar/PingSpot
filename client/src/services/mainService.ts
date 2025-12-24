import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
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
import { IReverseLocation } from "@/types/model/user";
import { ISearchDataResponse } from "@/types/api/search";

const REVERSE_LOCATION_API_URL = `${process.env.NEXT_PUBLIC_REVERSE_LOCATION_URL}`;

export const reverseCurrentLocationService = async (payload: IReverseLocationRequest): 
Promise<IReverseLocation> => {
    const response = await axios.get<IReverseLocation>(`${REVERSE_LOCATION_API_URL}?lat=${payload.latitude}&lon=${payload.longitude}&format=json`);
    return response.data;
};

export const createReportService = async (payload: FormData): Promise<ICreateReportResponse> => {
    const response = await axiosInstance.post<ICreateReportResponse>(`/report`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        },
    });
    return response.data;
}

export const getReportByIDService = async (reportID: number): Promise<IGetReportByIDResponse> => {
    const response = await axiosInstance.get<IGetReportByIDResponse>(`/report?reportID=${reportID}`);
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
    
    const response = await axiosInstance.get<IGetReportResponse>(`/report${queryString}`);
    return response.data;
}

export const getReportCommentsService = async (
    cursorID?: number,
    reportID?: number,
): Promise<IGetReportCommentsResponse> => {
    const params = new URLSearchParams();

    if (cursorID) params.append('cursorID', cursorID.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await axiosInstance.get<IGetReportCommentsResponse>(`/report/${reportID}/comment/${queryString}`);
    return response.data;
}

export const getProgressReportService = async (reportID: number): Promise<IGetProgressReportResponse> => {
    const response = await axiosInstance.get<IGetProgressReportResponse>(`/report/${reportID}/progress`);
    return response.data;
}

export const reactReportService = async (reportID: number, data: IReactReportRequest): Promise<IReactReportResponse> => {
    const response = await axiosInstance.post<IReactReportResponse>(`/report/${reportID}/reaction`, 
        { reactionType: data.reactionType }, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
        });
    return response.data;
}

export const voteReportService = async (reportID: number, data: IVoteReportRequest): Promise<IVoteReportResponse> => {
    const response = await axiosInstance.post<IVoteReportResponse>(`/report/${reportID}/vote`, 
        { voteType: data.voteType }, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
        });
    return response.data;
}

export const uploadProgressReportService = async (reportID: number, payload: FormData): Promise<IUploadProgressReportResponse> => {
    const response = await axiosInstance.post<IUploadProgressReportResponse>(`/report/${reportID}/progress`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        },
    });
    return response.data;
}

export const createReportCommentService = async (reportID: number, payload: FormData): Promise<ICreateReportCommentResponse> => {
    const response = await axiosInstance.post<ICreateReportCommentResponse>(`/report/${reportID}/comment`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        },
    });
    return response.data;
}

export const updateReportStatusService = async (reportID: number, status: string): Promise<IUpdateReportStatusResponse> => {
    const response = await axiosInstance.patch(`/report/${reportID}/status`, 
        { status });
    return response.data;
}

export const EditReportService = async (reportID: number, payload: FormData): Promise<IEditReportResponse> => {
    const response = await axiosInstance.put<IEditReportResponse>(`/report/${reportID}`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        },
    });
    return response.data;
}

export const DeleteReportService = async (payload: IDeleteReportRequest): Promise<IDeleteReportResponse> => {
    const response = await axiosInstance.delete<IDeleteReportResponse>(`/report/${payload.reportID}`);
    return response.data;
}

export const searchDataService = async (searchQuery: string): Promise<ISearchDataResponse> => {
    const response = await axiosInstance.get<ISearchDataResponse>(`/search/?searchQuery=${searchQuery}`);
    return response.data;
}
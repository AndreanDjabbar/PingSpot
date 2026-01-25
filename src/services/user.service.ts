/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGetUserStatisticsResponse, ISaveSecurityRequest, ISaveSecurityResponse } from "@/types/api/user";
import { IGetProfileResponse, ISaveProfileResponse } from "@/types/api/user";
import axiosInstance from "@/lib/axiosInstance";

export const saveProfileService = async (payload: FormData): Promise<ISaveProfileResponse> => {
    const response = await axiosInstance.post<ISaveProfileResponse>(`/user/profile`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        },
    });
    return response.data;
}

export const saveSecurityService = async (payload: ISaveSecurityRequest): Promise<ISaveSecurityResponse> => {
    const response = await axiosInstance.post<ISaveSecurityResponse>(`/user/security`, payload);
    return response.data;
}

export const getUserStatisticsService = async (): Promise<IGetUserStatisticsResponse> => {
    const response = await axiosInstance.get<IGetUserStatisticsResponse>(`/user/statistics/`);
    return response.data;
}

export const getMyProfileService = async (): Promise<IGetProfileResponse> => {
    const response = await axiosInstance.get<IGetProfileResponse>(`/user/profile/`);
    return response.data;
}

export const getProfileByUsernameService = async (username: string): Promise<IGetProfileResponse> => {
    const response = await axiosInstance.get<IGetProfileResponse>(`/user/profile/${username}`);
    return response.data;
}
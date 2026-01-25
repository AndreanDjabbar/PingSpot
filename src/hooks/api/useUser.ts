import { 
    getMyProfileService, 
    getProfileByUsernameService, 
    getUserStatisticsService, 
    saveProfileService, 
    saveSecurityService 
} from "@/services";
import { 
    IGetProfileResponse, 
    IGetUserStatisticsResponse, 
    ISaveProfileResponse, 
    ISaveSecurityRequest, 
    ISaveSecurityResponse 
} from "@/types/api/user";
import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios";

export const useGetProfileByUsername = (username: string) => {
    return useQuery<IGetProfileResponse, AxiosError>({
        queryKey: ['profile', username],
        queryFn: () => getProfileByUsernameService(username),
    })
}

export const useGetUserStatistics = () => {
    return useQuery<IGetUserStatisticsResponse, Error>({
        queryKey: ['user-statistics'],
        queryFn: () => getUserStatisticsService(),
    });
};

export const useMyProfile = () => {
    return useQuery<IGetProfileResponse, AxiosError>({
        queryKey: ['my-profile'],
        queryFn: () => getMyProfileService(),
    })
}

export const useSaveProfile = () => {
    return useMutation<ISaveProfileResponse, AxiosError, FormData>({
        mutationFn: (data: FormData) => saveProfileService(data) 
    })
}

export const useSaveSecurity = () => {
    return useMutation<ISaveSecurityResponse, AxiosError, ISaveSecurityRequest>({
        mutationFn: (data: ISaveSecurityRequest) => saveSecurityService(data) 
    })
}
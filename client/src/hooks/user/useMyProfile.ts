import { getMyProfileService } from "@/services/userService";
import { IGetProfileResponse } from "@/types/api/user";
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios";

export const useMyProfile = () => {
    return useQuery<IGetProfileResponse, AxiosError>({
        queryKey: ['my-profile'],
        queryFn: () => getMyProfileService(),
    })
}
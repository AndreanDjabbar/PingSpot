import { getProfileByUsernameService } from "@/services/userService";
import { IGetProfileResponse } from "@/types/api/user";
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios";

export const useGetProfileByUsername = (username: string) => {
    return useQuery<IGetProfileResponse, AxiosError>({
        queryKey: ['profile', username],
        queryFn: () => getProfileByUsernameService(username),
    })
}
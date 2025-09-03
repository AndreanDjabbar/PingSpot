import { getMyProfileService } from "@/services/userService";
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios";

export const useMyProfile = () => {
    return useMutation<unknown, AxiosError, void>({
        mutationFn: () => getMyProfileService()
    })
}
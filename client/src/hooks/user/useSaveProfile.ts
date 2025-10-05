import { saveProfileService } from "@/services/userService";
import { ISaveProfileResponse } from "@/types/api/user";
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios";

export const useSaveProfile = () => {
    return useMutation<ISaveProfileResponse, AxiosError, FormData>({
        mutationFn: (data: FormData) => saveProfileService(data) 
    })
}
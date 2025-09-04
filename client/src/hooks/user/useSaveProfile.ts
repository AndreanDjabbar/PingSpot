import { saveProfileService } from "@/services/userService";
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios";

export const useSaveProfile = () => {
    return useMutation<unknown, AxiosError, FormData>({
        mutationFn: (data: FormData) => saveProfileService(data) 
    })
}
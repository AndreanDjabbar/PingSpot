import { saveProfileService } from "@/services/userService";
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { ISaveProfileFormType } from "@/types/userTypes";

export const useSaveProfile = () => {
    return useMutation<unknown, AxiosError, ISaveProfileFormType>({
        mutationFn: (data: ISaveProfileFormType) => saveProfileService(data) 
    })
}
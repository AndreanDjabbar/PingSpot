import { saveSecurityService } from "@/services/userService";
import { ISaveSecurityFormType } from "@/types/userTypes";
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios";

export const useSaveSecurity = () => {
    return useMutation<unknown, AxiosError, ISaveSecurityFormType>({
        mutationFn: (data: ISaveSecurityFormType) => saveSecurityService(data) 
    })
}
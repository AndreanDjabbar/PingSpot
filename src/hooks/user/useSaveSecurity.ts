import { saveSecurityService } from "@/services/userService";
import { ISaveSecurityRequest, ISaveSecurityResponse } from "@/types/api/user";
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios";

export const useSaveSecurity = () => {
    return useMutation<ISaveSecurityResponse, AxiosError, ISaveSecurityRequest>({
        mutationFn: (data: ISaveSecurityRequest) => saveSecurityService(data) 
    })
}
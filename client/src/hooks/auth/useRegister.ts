import { useMutation } from "@tanstack/react-query";
import { registerService } from "@/services/userService";
import { AxiosError } from "axios";
import { IRegisterRequest, IRegisterResponse } from "@/types/api/auth";

export const useRegister = () => {
    return useMutation<IRegisterResponse, AxiosError, IRegisterRequest>({
        mutationFn: (data: IRegisterRequest) => registerService(data)
    });
}
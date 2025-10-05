import { ILoginRequest, ILoginResponse } from "@/types/api/auth";
import { loginService } from "@/services/userService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useLogin = () => {
    return useMutation<ILoginResponse, AxiosError, ILoginRequest>({
        mutationFn: (data: ILoginRequest) => loginService(data)
    });
}
import { ILoginFormType } from "@/app/auth/types";
import { loginService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useLogin = () => {
    return useMutation<unknown, AxiosError, ILoginFormType>({
        mutationFn: (data: ILoginFormType) => loginService(data)
    });
}
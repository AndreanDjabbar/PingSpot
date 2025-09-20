import { ILoginFormType } from "@/app/auth/Schema";
import { loginService } from "@/services/userService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useLogin = () => {
    return useMutation<unknown, AxiosError, ILoginFormType>({
        mutationFn: (data: ILoginFormType) => loginService(data)
    });
}
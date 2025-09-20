import { useMutation } from "@tanstack/react-query";
import { registerService } from "@/services/userService";
import { AxiosError } from "axios";
import { IRegisterFormType } from "@/app/auth/Schema";

export const useRegister = () => {
    return useMutation<unknown, AxiosError, IRegisterFormType>({
        mutationFn: (data: IRegisterFormType) => registerService(data)
    });
}
import { useMutation } from "@tanstack/react-query";
import { registerService } from "@/services/authService";
import { AxiosError } from "axios";
import { IRegisterFormType } from "@/types/authTypes";

export const useRegister = () => {
    return useMutation<unknown, AxiosError, IRegisterFormType>({
        mutationFn: (data: IRegisterFormType) => registerService(data)
    });
}
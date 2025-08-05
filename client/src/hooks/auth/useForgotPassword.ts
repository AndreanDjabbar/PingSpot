import { IForgotPasswordFormEmailType } from "@/app/auth/types";
import { sendForgotPasswordEmailVerificationService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useEmailVerification = () => {
    return useMutation<unknown, AxiosError, IForgotPasswordFormEmailType>({
        mutationFn: (data: IForgotPasswordFormEmailType) => sendForgotPasswordEmailVerificationService(data)
    });
}
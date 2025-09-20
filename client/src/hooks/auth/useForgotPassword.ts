import { IForgotPasswordFormEmailType, IForgotPasswordResetPasswordType } from "@/app/auth/Schema";
import { linkVerificationService, resetPasswordService, sendForgotPasswordEmailVerificationService } from "@/services/userService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useEmailVerification = () => {
    return useMutation<unknown, AxiosError, IForgotPasswordFormEmailType>({
        mutationFn: (data: IForgotPasswordFormEmailType) => sendForgotPasswordEmailVerificationService(data)
    });
}

export const useLinkVerification = () => {
    return useMutation<unknown, AxiosError, { code: string; email: string }>({
        mutationFn: ({ code, email }) => linkVerificationService({ code, email })
    });
}

export const useResetPassword = () => {
    return useMutation<unknown, AxiosError, IForgotPasswordResetPasswordType>({
        mutationFn: (data: IForgotPasswordResetPasswordType) => resetPasswordService(data)
    })
}
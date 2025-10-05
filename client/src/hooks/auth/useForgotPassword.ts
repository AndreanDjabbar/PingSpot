import { linkVerificationService, resetPasswordService, sendForgotPasswordEmailVerificationService } from "@/services/userService";
import { IForgotPasswordEmailVerificationRequest, IForgotPasswordEmailVerificationResponse, IForgotPasswordLinkVerificationRequest, IForgotPasswordLinkVerificationResponse, IForgotPasswordResetPasswordRequest, IForgotPasswordResetPasswordResponse } from "@/types/api/auth";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useEmailVerification = () => {
    return useMutation<IForgotPasswordEmailVerificationResponse, AxiosError, IForgotPasswordEmailVerificationRequest>({
        mutationFn: (data: IForgotPasswordEmailVerificationRequest) => sendForgotPasswordEmailVerificationService(data)
    });
}

export const useLinkVerification = () => {
    return useMutation<IForgotPasswordLinkVerificationResponse, AxiosError, IForgotPasswordLinkVerificationRequest>({
        mutationFn: (data: IForgotPasswordLinkVerificationRequest) => linkVerificationService(data)
    });
}

export const useResetPassword = () => {
    return useMutation<IForgotPasswordResetPasswordResponse, AxiosError, IForgotPasswordResetPasswordRequest>({
        mutationFn: (data: IForgotPasswordResetPasswordRequest) => resetPasswordService(data)
    })
}
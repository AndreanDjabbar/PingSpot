import { 
    linkVerificationService, 
    loginService, 
    logoutService, 
    registerService, 
    resetPasswordService, sendForgotPasswordEmailVerificationService, 
    verificationService
} from "@/services";
import { IForgotPasswordEmailVerificationRequest, IForgotPasswordEmailVerificationResponse, IForgotPasswordLinkVerificationRequest, IForgotPasswordLinkVerificationResponse, IForgotPasswordResetPasswordRequest, IForgotPasswordResetPasswordResponse, ILoginRequest, ILoginResponse, ILogoutResponse, IRegisterRequest, IRegisterResponse, IVerificationRequest, IVerificationResponse } from "@/types/api/auth";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useRegister = () => {
    return useMutation<IRegisterResponse, AxiosError, IRegisterRequest>({
        mutationFn: (data: IRegisterRequest) => registerService(data)
    });
}

export const useLogin = () => {
    return useMutation<ILoginResponse, AxiosError, ILoginRequest>({
        mutationFn: (data: ILoginRequest) => loginService(data)
    });
}

export const useLogout = () => {
    return useMutation<ILogoutResponse, AxiosError>({
        mutationFn: () => logoutService()
    });
}

export const useEmailVerification = () => {
    return useMutation<IForgotPasswordEmailVerificationResponse, AxiosError, IForgotPasswordEmailVerificationRequest>({
        mutationFn: (data: IForgotPasswordEmailVerificationRequest) => sendForgotPasswordEmailVerificationService(data)
    });
}

export const useVerification = () => {
    return useMutation<IVerificationResponse, AxiosError, IVerificationRequest>({
        mutationFn: (data: IVerificationRequest) => verificationService(data)
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
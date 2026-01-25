/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    IForgotPasswordEmailVerificationRequest, 
    IForgotPasswordEmailVerificationResponse, 
    IForgotPasswordLinkVerificationRequest, 
    IForgotPasswordLinkVerificationResponse, 
    IForgotPasswordResetPasswordRequest, 
    IForgotPasswordResetPasswordResponse, 
    ILoginRequest, 
    ILoginResponse, 
    IRegisterRequest, 
    IRegisterResponse, 
    IVerificationRequest, 
    IVerificationResponse 
} from "@/types/api/auth";
import axiosInstance from "@/lib/axiosInstance";


type IResponseType = {
    message: string;
    data?: any;
}

export const registerService = async (payload: IRegisterRequest): Promise<IRegisterResponse> => {
    const response = await axiosInstance.post<IRegisterResponse>(`auth/register`, payload);
    return response.data;
};

export const loginService = async (payload: ILoginRequest): Promise<ILoginResponse> => {
    const response = await axiosInstance.post<ILoginResponse>(`auth/login`, payload, {
        withCredentials: true
    });
    return response.data;
};

export const logoutService = async (): Promise<IResponseType> => {
    const response = await axiosInstance.post<IResponseType>(`auth/logout`, {}, {
        withCredentials: true
    });
    return response.data;
}

export const verificationService = async (payload: IVerificationRequest): Promise<IVerificationResponse> => {
    const response = await axiosInstance.post<IVerificationResponse>(`auth/verification?code1=${payload.code1}&userId=${payload.userId}&code2=${payload.code2}`);
    return response.data;
}

export const sendForgotPasswordEmailVerificationService = async (payload: IForgotPasswordEmailVerificationRequest): Promise<IForgotPasswordEmailVerificationResponse> => {
    const response = await axiosInstance.post<IForgotPasswordEmailVerificationResponse>(`auth/forgot-password/email-verification`, payload);
    return response.data;
}

export const linkVerificationService = async (payload: IForgotPasswordLinkVerificationRequest): Promise<IForgotPasswordLinkVerificationResponse> => {
    const response = await axiosInstance.post<IForgotPasswordLinkVerificationResponse>(`auth/forgot-password/link-verification?code=${payload.code}&email=${payload.email}`);
    return response.data;
}

export const resetPasswordService = async (payload: IForgotPasswordResetPasswordRequest): Promise<IForgotPasswordResetPasswordResponse> => {
    const response = await axiosInstance.post<IForgotPasswordResetPasswordResponse>(`auth/forgot-password/reset-password`, payload);
    return response.data;
};
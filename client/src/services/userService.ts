/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISaveSecurityRequest, ISaveSecurityResponse } from "@/types/api/user";
import { IForgotPasswordEmailVerificationRequest, IForgotPasswordEmailVerificationResponse, IForgotPasswordLinkVerificationRequest, IForgotPasswordLinkVerificationResponse, IForgotPasswordResetPasswordRequest, IForgotPasswordResetPasswordResponse, ILoginRequest, ILoginResponse, IRegisterRequest, IRegisterResponse, IVerificationRequest, IVerificationResponse } from "@/types/api/auth";
import { IGetProfileResponse, ISaveProfileResponse } from "@/types/api/user";
import getAuthToken from "@/utils/getAuthToken";
import axios from "axios";

const USER_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/user`;
const AUTH_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

type IResponseType = {
    message: string;
    data?: any;
}

const COMMON_HEADERS = (authToken: string) => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    }
}

const MULTIPART_HEADERS = (authToken: string) => {
    return {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    }
}

export const registerService = async (payload: IRegisterRequest): Promise<IRegisterResponse> => {
    const response = await axios.post<IRegisterResponse>(`${AUTH_API_URL}/register`, payload);
    return response.data;
};

export const loginService = async (payload: ILoginRequest): Promise<ILoginResponse> => {
    const response = await axios.post<ILoginResponse>(`${AUTH_API_URL}/login`, payload);
    return response.data;
};

export const logoutService = async (): Promise<IResponseType> => {
    const authToken = getAuthToken();
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/logout`, {}, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });
    return response.data;
}

export const verificationService = async (payload: IVerificationRequest): Promise<IVerificationResponse> => {
    const response = await axios.post<IVerificationResponse>(`${AUTH_API_URL}/verification?code1=${payload.code1}&userId=${payload.userId}&code2=${payload.code2}`);
    return response.data;
}

export const sendForgotPasswordEmailVerificationService = async (payload: IForgotPasswordEmailVerificationRequest): Promise<IForgotPasswordEmailVerificationResponse> => {
    const response = await axios.post<IForgotPasswordEmailVerificationResponse>(`${AUTH_API_URL}/forgot-password/email-verification`, payload);
    return response.data;
}

export const linkVerificationService = async (payload: IForgotPasswordLinkVerificationRequest): Promise<IForgotPasswordLinkVerificationResponse> => {
    const response = await axios.post<IForgotPasswordLinkVerificationResponse>(`${AUTH_API_URL}/forgot-password/link-verification?code=${payload.code}&email=${payload.email}`);
    return response.data;
}

export const resetPasswordService = async (payload: IForgotPasswordResetPasswordRequest): Promise<IForgotPasswordResetPasswordResponse> => {
    const response = await axios.post<IForgotPasswordResetPasswordResponse>(`${AUTH_API_URL}/forgot-password/reset-password`, payload);
    return response.data;
};

export const saveProfileService = async (payload: FormData): Promise<ISaveProfileResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<ISaveProfileResponse>(`${USER_API_URL}/profile`, payload, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const saveSecurityService = async (payload: ISaveSecurityRequest): Promise<ISaveSecurityResponse> => {
    const authToken = getAuthToken();
    const response = await axios.post<ISaveSecurityResponse>(`${USER_API_URL}/security`, payload, COMMON_HEADERS(authToken || ''));
    return response.data;
}

export const getMyProfileService = async (): Promise<IGetProfileResponse> => {
    const authToken = getAuthToken();
    const response = await axios.get<IGetProfileResponse>(`${USER_API_URL}/profile/`, COMMON_HEADERS(authToken || ''));
    return response.data;
}
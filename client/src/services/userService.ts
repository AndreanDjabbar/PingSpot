/* eslint-disable @typescript-eslint/no-explicit-any */
import { IForgotPasswordFormEmailType, IForgotPasswordResetPasswordType, ILoginFormType, IRegisterFormType, IVerificationFormType } from "@/app/auth/Schema";
import { ISaveSecurityFormType } from "@/app/main/schema";
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

export const registerService = async (payload: IRegisterFormType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/register`, payload);
    return response.data;
};

export const loginService = async (payload: ILoginFormType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/login`, payload);
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

export const verificationService = async (payload: IVerificationFormType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/verification?code1=${payload.code1}&userId=${payload.userId}&code2=${payload.code2}`);
    return response.data;
}

export const sendForgotPasswordEmailVerificationService = async (payload: IForgotPasswordFormEmailType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/forgot-password/email-verification`, payload);
    return response.data;
}

export const linkVerificationService = async ({ code, email }: { code: string; email: string }): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/forgot-password/link-verification?code=${code}&email=${email}`);
    return response.data;
}

export const resetPasswordService = async (payload: IForgotPasswordResetPasswordType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/forgot-password/reset-password`, payload);
    return response.data;
};

export const saveProfileService = async (payload: FormData): Promise<IResponseType> => {
    const authToken = getAuthToken();
    const response = await axios.post<IResponseType>(`${USER_API_URL}/profile`, payload, MULTIPART_HEADERS(authToken || ''));
    return response.data;
}

export const saveSecurityService = async (payload: ISaveSecurityFormType): Promise<IResponseType> => {
    const authToken = getAuthToken();
    const response = await axios.post<IResponseType>(`${USER_API_URL}/security`, payload, COMMON_HEADERS(authToken || ''));
    return response.data;
}

export const getMyProfileService = async (): Promise<IResponseType> => {
    const authToken = getAuthToken();
    const response = await axios.get<IResponseType>(`${USER_API_URL}/profile/`, COMMON_HEADERS(authToken || ''));
    return response.data;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IForgotPasswordFormEmailType, IForgotPasswordResetPasswordType, ILoginFormType, ILogoutType, IRegisterFormType, IVerificationType } from "@/types/authTypes";
import axios from "axios";

const USER_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/user`;

type IResponseType = {
    message: string;
    data?: any;
}

export const registerService = async (payload: IRegisterFormType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${USER_API_URL}/auth/register`, payload);
    return response.data;
};

export const loginService = async (payload: ILoginFormType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${USER_API_URL}/auth/login`, payload);
    return response.data;
};

export const logoutService = async (payload: ILogoutType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${USER_API_URL}/auth/logout`, {}, {
        headers: {
            'Authorization': `Bearer ${payload.authToken}`
        }
    });
    return response.data;
}

export const verificationService = async (payload: IVerificationType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${USER_API_URL}/auth/verification?code1=${payload.code1}&userId=${payload.userId}&code2=${payload.code2}`);
    return response.data;
}

export const sendForgotPasswordEmailVerificationService = async (payload: IForgotPasswordFormEmailType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${USER_API_URL}/auth/forgot-password/email-verification`, payload);
    return response.data;
}

export const linkVerificationService = async ({ code, email }: { code: string; email: string }): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${USER_API_URL}/auth/forgot-password/link-verification?code=${code}&email=${email}`);
    return response.data;
}

export const resetPasswordService = async (payload: IForgotPasswordResetPasswordType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${USER_API_URL}/auth/forgot-password/reset-password`, payload);
    return response.data;
};
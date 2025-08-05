/* eslint-disable @typescript-eslint/no-explicit-any */
import { IForgotPasswordFormEmailType, IForgotPasswordResetPasswordType, ILoginFormType, IRegisterFormType, IVerificationType } from "@/app/auth/types";
import axios from "axios";

const AUTH_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

type IResponseType = {
    message: string;
    data?: any;
}

export const registerService = async (payload: IRegisterFormType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/register`, payload);
    return response.data;
};

export const loginService = async (payload: ILoginFormType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/login`, payload);
    return response.data;
};

export const verificationService = async (payload: IVerificationType): Promise<IResponseType> => {
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRegisterFormType, IVerificationType } from "@/app/auth/types";
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

export const verificationService = async (payload: IVerificationType): Promise<IResponseType> => {
    const response = await axios.post<IResponseType>(`${AUTH_API_URL}/verification?code1=${payload.code1}&userId=${payload.userId}&code2=${payload.code2}`);
    return response.data;
}
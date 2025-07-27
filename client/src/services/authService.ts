/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRegisterFormType } from "@/app/auth/types";
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

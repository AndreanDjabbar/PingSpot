/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";

interface IErrorResponse {
    message?: string;
    errors?: any;
}

export const getErrorResponseMessage = (error: unknown): string => {
    if ((error as AxiosError<IErrorResponse>)?.isAxiosError) {
        const axiosError = error as AxiosError<IErrorResponse>;
        const res = axiosError.response?.data;
        if (res?.message) {
            return res.message;
        } else {
            return axiosError.message;
        }
    }
    return "Terjadi kesalahan tak terduga."
};

export const getErrorResponseDetails = (error: unknown): any => {
    if ((error as AxiosError<IErrorResponse>)?.isAxiosError) {
        const axiosError = error as AxiosError<IErrorResponse>;
        const res = axiosError.response?.data;
        if (res?.errors && typeof res.errors === "object") {
            return res.errors;
        } else if (Array.isArray(res?.errors)) {
            return res.errors.join(", ");
        } else if (typeof res?.errors === "string") {
            return res.errors; 
        }
    }
    return "Terjadi kesalahan tak terduga."
}
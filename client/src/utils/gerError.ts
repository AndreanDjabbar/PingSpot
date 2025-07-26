/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";

export interface ErrorResponse {
    message?: string;
    errors?: Record<string, string> | string[];
}

export const getErrorMessage = (error: unknown): string => {
    if ((error as AxiosError<ErrorResponse>)?.isAxiosError) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const res = axiosError.response?.data;
        if (res?.message) {
            return res.message;
        } else {
            return axiosError.message;
        }
    }
    return "Terjadi kesalahan tak terduga."
};

export const getErrorDetails = (error: unknown): any => {
    if ((error as AxiosError<ErrorResponse>)?.isAxiosError) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const res = axiosError.response?.data;
        if (res?.errors && typeof res.errors === "object") {
            return res.errors;
        } else if (Array.isArray(res?.errors)) {
            return res.errors.join(", ");
        }
    }
    return "Terjadi kesalahan tak terduga."
}
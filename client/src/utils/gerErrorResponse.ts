import { AxiosError } from "axios";

interface IErrorResponse {
    success?: boolean;
    message?: string;
    errors?: unknown;
    error_code?: string;
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
    } else if (typeof error === "string") {
        return error as string;

    }
    return "Terjadi kesalahan tak terduga."
};

export const getErrorResponseDetails = (error: unknown): unknown => {
    if ((error as AxiosError<IErrorResponse>)?.isAxiosError) {
        const axiosError = error as AxiosError<IErrorResponse>;
        const res = axiosError.response?.data;
        if (res?.errors) {
            if (res?.errors && typeof res.errors === "object") {
                return res.errors;
            } else if (Array.isArray(res?.errors)) {
                return res.errors.join(", ");
            } else if (typeof res?.errors === "string") {
                return res.errors; 
            }
        } else {
            return res?.message
        }
    } else if (typeof error === "string") {
        return error as string;
    }
    return "Terjadi kesalahan tak terduga."
}

export const getErrorCode = (error: unknown): string | undefined => {
    if ((error as AxiosError<IErrorResponse>)?.isAxiosError) {
        const axiosError = error as AxiosError<IErrorResponse>;
        return axiosError.response?.data?.error_code;
    }
    return undefined;
};

export const getErrorStatusCode = (error: unknown): number | undefined => {
    if ((error as AxiosError<IErrorResponse>)?.isAxiosError) {
        const axiosError = error as AxiosError<IErrorResponse>;
        return axiosError.response?.status;
    }
    return undefined;
};

export const isErrorCode = (error: unknown, code: string): boolean => {
    return getErrorCode(error) === code;
};

export const isNotFoundError = (error: unknown): boolean => {
    const statusCode = getErrorStatusCode(error);
    const errorCode = getErrorCode(error);
    return statusCode === 404 || errorCode?.includes('NOT_FOUND') || false;
};

export const isInternalServerError = (error: unknown): boolean => {
    const statusCode = getErrorStatusCode(error);
    return statusCode === 500;
};
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'
import { getDataResponseMessage, getErrorResponseMessage } from '@/utils';
import { toast, ToastOptions } from 'react-toastify';

export const useToast = () => {
    const defaultOptions: ToastOptions = {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const toastSuccess = (message: string) => {
        toast.success(message, {
            ...defaultOptions,
            className: "font-bold border 2 border-green-600 text-white"
        });
    }

    const toastError = (message: string) => {
        toast.error(message, {
            ...defaultOptions,
            className: "font-bold border-2 border-red-600 text-white"
        });
    };
    return { toastSuccess, toastError }
};

export const useErrorToast = (isError: boolean, error: any) => {
    const { toastError } = useToast();
    const errorRef = useRef<string | null>(null);

    useEffect(() => {
        if (isError && error) {
            const currentError = getErrorResponseMessage(error);
            if (errorRef.current !== currentError) {
                toastError(currentError);
                errorRef.current = currentError;
            }
        }
        if (!isError) {
            errorRef.current = null;
        }
    }, [isError, error, toastError])

}

export const useSuccessToast = (isSuccess: boolean, data: any) => {
    const { toastSuccess } = useToast();
    const successRef = useRef<string | null>(null);

    useEffect(() => {
        if (isSuccess && data) {
            const currentSuccess = getDataResponseMessage(data) || 'Operasi berhasil';
            if (successRef.current !== currentSuccess) {
                toastSuccess(getDataResponseMessage(data) || 'Operasi berhasil');
                successRef.current = currentSuccess;
            }
        }
        if (!isSuccess) {
            successRef.current = null;
        }
    }, [isSuccess, data, toastSuccess]);

}
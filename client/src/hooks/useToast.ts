import { toast, ToastOptions } from "react-toastify";

export const useToast = () => {
    const defaultOptions: ToastOptions = {
        position: "top-center",
        autoClose: 10000,
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
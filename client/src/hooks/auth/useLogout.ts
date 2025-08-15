import { ILogoutType } from "@/types/authTypes";
import { logoutService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useLogout = () => {
    return useMutation<unknown, AxiosError, ILogoutType>({
        mutationFn: (data: ILogoutType) => logoutService(data)
    });
}
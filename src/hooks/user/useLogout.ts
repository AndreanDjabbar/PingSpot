import { logoutService } from "@/services/userService";
import { ILogoutResponse } from "@/types/api/user";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useLogout = () => {
    return useMutation<ILogoutResponse, AxiosError>({
        mutationFn: () => logoutService()
    });
}
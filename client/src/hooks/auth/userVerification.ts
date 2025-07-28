import { useMutation } from "@tanstack/react-query";
import { verificationService } from "@/services/authService";
import { AxiosError } from "axios";
import { IVerificationType } from "@/app/auth/types";

export const useVerification = () => {
    return useMutation<unknown, AxiosError, IVerificationType>({
        mutationFn: (data: IVerificationType) => verificationService(data)
    });
}
import { useMutation } from "@tanstack/react-query";
import { verificationService } from "@/services/userService";
import { AxiosError } from "axios";
import { IVerificationType } from "@/types/authTypes";

export const useVerification = () => {
    return useMutation<unknown, AxiosError, IVerificationType>({
        mutationFn: (data: IVerificationType) => verificationService(data)
    });
}
import { useMutation } from "@tanstack/react-query";
import { verificationService } from "@/services/userService";
import { AxiosError } from "axios";
import { IVerificationRequest, IVerificationResponse } from "@/types/api/auth";

export const useVerification = () => {
    return useMutation<IVerificationResponse, AxiosError, IVerificationRequest>({
        mutationFn: (data: IVerificationRequest) => verificationService(data)
    });
}
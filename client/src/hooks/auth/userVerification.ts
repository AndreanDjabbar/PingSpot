import { useMutation } from "@tanstack/react-query";
import { verificationService } from "@/services/userService";
import { AxiosError } from "axios";
import { IVerificationFormType } from "@/app/auth/Schema";

export const useVerification = () => {
    return useMutation<unknown, AxiosError, IVerificationFormType>({
        mutationFn: (data: IVerificationFormType) => verificationService(data)
    });
}
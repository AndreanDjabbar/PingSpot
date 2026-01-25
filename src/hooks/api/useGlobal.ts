import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { IReverseLocation, IReverseLocationRequest } from "@/types";
import { reverseCurrentLocationService } from "@/services";

export const useReverseCurrentLocation = (options?: {
    onSuccess?: (data: IReverseLocation) => void;
}) => {
    return useMutation<IReverseLocation, AxiosError, IReverseLocationRequest>({
        mutationFn: (data: IReverseLocationRequest) => reverseCurrentLocationService(data),
        ...options,
    });
};

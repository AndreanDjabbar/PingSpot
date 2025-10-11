import { IReverseLocationRequest } from "@/types/api/user";
import { reverseCurrentLocationService } from "@/services/mainService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { IReverseLocation } from "@/types/model/user";

export const useReverseCurrentLocation = (options?: {
    onSuccess?: (data: IReverseLocation) => void;
}) => {
    return useMutation<IReverseLocation, AxiosError, IReverseLocationRequest>({
        mutationFn: (data: IReverseLocationRequest) => reverseCurrentLocationService(data),
        ...options,
    });
};

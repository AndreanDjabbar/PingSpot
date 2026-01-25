import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { IReverseLocation } from "@/types/model/user";
import { reverseCurrentLocationService } from "@/services";
import { IReverseLocationRequest } from "@/types/api/global";

export const useReverseCurrentLocation = (options?: {
    onSuccess?: (data: IReverseLocation) => void;
}) => {
    return useMutation<IReverseLocation, AxiosError, IReverseLocationRequest>({
        mutationFn: (data: IReverseLocationRequest) => reverseCurrentLocationService(data),
        ...options,
    });
};

import { IReverseLocationRequest, IReverseLocationResponse } from "@/types/api/user";
import { reverseCurrentLocationService } from "@/services/mainService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useReverseCurrentLocation = () => {
    return useMutation<IReverseLocationResponse, AxiosError, IReverseLocationRequest>({
        mutationFn: (data: IReverseLocationRequest) => reverseCurrentLocationService(data)
    });
}
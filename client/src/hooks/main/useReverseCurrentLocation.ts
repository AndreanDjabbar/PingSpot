import { IReverseLocationRequest } from "@/types/entity/mainTypes";
import { IReverseLocationResponse } from "@/types/response/mainTypes";
import { reverseCurrentLocationService } from "@/services/mainService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useReverseCurrentLocation = () => {
    return useMutation<IReverseLocationResponse, AxiosError, IReverseLocationRequest>({
        mutationFn: (data: IReverseLocationRequest) => reverseCurrentLocationService(data)
    });
}
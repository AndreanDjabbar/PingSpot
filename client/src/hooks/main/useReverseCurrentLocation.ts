import { IReverseLocationType } from "@/types/mainTypes";
import { reverseCurrentLocationService } from "@/services/mainService";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useReverseCurrentLocation = () => {
    return useMutation<unknown, AxiosError, IReverseLocationType>({
        mutationFn: (data: IReverseLocationType) => reverseCurrentLocationService(data)
    });
}
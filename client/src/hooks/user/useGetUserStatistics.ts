import { getUserStatisticsService } from "@/services/userService";
import { IGetUserStatisticsResponse } from "@/types/api/user";
import { useQuery } from "@tanstack/react-query";

export const useGetUserStatistics = () => {
    return useQuery<IGetUserStatisticsResponse, Error>({
        queryKey: ['user-statistics'],
        queryFn: () => getUserStatisticsService(),
    });
};

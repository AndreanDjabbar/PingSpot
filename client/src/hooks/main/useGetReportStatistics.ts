import { getReportStatisticsService } from "@/services/mainService";
import { useQuery } from "@tanstack/react-query";
import { IGetReportStatisticsResponse } from "@/types/api/report";

export const useGetReportStatistics = () => {
    return useQuery<IGetReportStatisticsResponse, Error>({
        queryKey: ['report-statistics'],
        queryFn: () => getReportStatisticsService(),
    });
};

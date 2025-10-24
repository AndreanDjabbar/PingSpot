import { getReportByIDService, getReportService } from "@/services/mainService"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { IGetReportByIDResponse, IGetReportResponse } from "@/types/api/report"

export const useGetReport = () => {
    return useInfiniteQuery<IGetReportResponse, Error>({
        queryKey: ['report'],
        queryFn: ({ pageParam }) => getReportService(pageParam as number | undefined),
        getNextPageParam: (lastPage) => lastPage.data?.nextCursor ?? undefined,
        initialPageParam: undefined,
    });
};

export const useGetReportByID = (reportID: number) => {
    return useQuery<IGetReportByIDResponse, Error>({
        queryKey: ['report-by-id', reportID],
        queryFn: () => getReportByIDService(reportID),
    });
}
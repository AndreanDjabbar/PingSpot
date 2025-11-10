import { getReportByIDService, getReportService } from "@/services/mainService"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { IGetReportByIDResponse, IGetReportResponse } from "@/types/api/report"

export const useGetReport = (
    reportType?: string,
    status?: string,
    sortBy?: string,
    hasProgress?: string,
    distance? : { distance: string; lat: string | null; lng: string | null },
    enabled: boolean = true
) => {
    return useInfiniteQuery<IGetReportResponse, Error>({
        queryKey: ['report', reportType, status, sortBy, distance, hasProgress],
        queryFn: ({ pageParam }) => getReportService(
            pageParam as number | undefined,
            reportType,
            status,
            sortBy,
            distance,
            hasProgress
        ),
        getNextPageParam: (lastPage) => lastPage.data?.nextCursor ?? undefined,
        initialPageParam: undefined,
        enabled,
    });
};

export const useGetReportByID = (reportID: number) => {
    return useQuery<IGetReportByIDResponse, Error>({
        queryKey: ['report-by-id', reportID],
        queryFn: () => getReportByIDService(reportID),
    });
}
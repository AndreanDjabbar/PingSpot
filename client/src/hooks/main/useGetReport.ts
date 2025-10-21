import { getReportService } from "@/services/mainService"
import { useInfiniteQuery } from "@tanstack/react-query"
import { IGetReportResponse } from "@/types/api/report"

export const useGetReport = () => {
    return useInfiniteQuery<IGetReportResponse, Error>({
        queryKey: ['report'],
        queryFn: ({ pageParam }) => getReportService(pageParam as number | undefined),
        getNextPageParam: (lastPage) => lastPage.data?.nextCursor ?? undefined,
        initialPageParam: undefined,
    });
};
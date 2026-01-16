import { getReportCommentsService } from "@/services/mainService";
import { IGetReportCommentsResponse } from "@/types/api/report";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetReportComments = (
    reportID: number,
    enabled: boolean = true
) => {
    return useInfiniteQuery<IGetReportCommentsResponse, Error>({
        queryKey: ['report', reportID, 'comments'],
        queryFn: ({ pageParam }) => getReportCommentsService(
            pageParam as number | undefined,
            reportID
        ),
        getNextPageParam: (lastPage) => lastPage.data?.nextCursor ?? undefined,
        initialPageParam: undefined,
        enabled,
    });
};
import { getReportCommentRepliesService } from "@/services/mainService";
import { IGetReportCommentRepliesResponse } from "@/types/api/report";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetReportCommentReplies = (
    rootID: string,
    enabled: boolean = true
) => {
    return useInfiniteQuery<IGetReportCommentRepliesResponse, Error>({
        queryKey: ['report', 'comment', rootID, 'replies'],
        queryFn: ({ pageParam }) => getReportCommentRepliesService(
            pageParam as number | undefined,
            rootID
        ),
        getNextPageParam: (lastPage) => lastPage.data?.nextCursor ?? undefined,
        initialPageParam: undefined,
        enabled,
    });
};
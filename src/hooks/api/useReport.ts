import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
    createReportCommentService,
    createReportService, 
    DeleteReportService,
    EditReportService,
    getProgressReportService,
    getReportByIDService,
    getReportCommentRepliesService,
    getReportCommentsService,
    getReportService,
    getReportStatisticsService,
    reactReportService,
    uploadProgressReportService,
    voteReportService
} from "@/services"
import { 
    ICreateReportCommentResponse,
    ICreateReportResponse, 
    IDeleteReportRequest, 
    IDeleteReportResponse,
    IEditReportResponse,
    IGetProgressReportResponse,
    IGetReportByIDResponse,
    IGetReportCommentRepliesResponse,
    IGetReportCommentsResponse,
    IGetReportResponse,
    IGetReportStatisticsResponse,
    IReactReportRequest,
    IReactReportResponse,
    IUploadProgressReportResponse,
    IVoteReportRequest,
    IVoteReportResponse
} from "@/types"

export const useCreateReport = () => {
    return useMutation<ICreateReportResponse, Error, FormData>({
        mutationFn: (data: FormData) => createReportService(data)
    })
}

interface ICreateReportCommentProps {
    reportID: number;
    data: FormData;
}

export const useCreateReportCommentReport = () => {
    const queryClient = useQueryClient();
    return useMutation<ICreateReportCommentResponse, Error, ICreateReportCommentProps>({
        mutationFn: (data: ICreateReportCommentProps) => createReportCommentService(data.reportID, data.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['report', variables.reportID, 'comments']});
            queryClient.invalidateQueries({queryKey: ['report', 'comment', data.data?.threadRootID, 'replies']});
        },
    })
}

export const useDeleteReport = () => {
    return useMutation<IDeleteReportResponse, Error, IDeleteReportRequest>({
        mutationFn: (payload: IDeleteReportRequest) => DeleteReportService(payload)
    })
}

interface IEditReportProps {
    reportID: number;
    data: FormData;
}

export const useEditReport = () => {
    return useMutation<IEditReportResponse, Error, IEditReportProps>({
        mutationFn: (payload: IEditReportProps) => EditReportService(payload.reportID, payload.data)
    })
}

export const useGetProgressReport = (reportID: number) => {
    return useQuery<IGetProgressReportResponse, Error>({
        queryKey: ['report-progress', reportID],
        queryFn: () => getProgressReportService(reportID),
    });
};

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

export const useGetReportStatistics = () => {
    return useQuery<IGetReportStatisticsResponse, Error>({
        queryKey: ['report-statistics'],
        queryFn: () => getReportStatisticsService(),
    });
};

type reactReportParams = {
    reportID: number;
    data: IReactReportRequest;
}

export const useReactReport = () => {
    return useMutation<IReactReportResponse, Error, reactReportParams>({
        mutationFn: ({ reportID, data }) => reactReportService(reportID, data),
    });
};

interface IUploadProgressReportProps {
    reportID: number;
    data: FormData;
}

export const useUploadProgressReport = () => {
    return useMutation<IUploadProgressReportResponse, Error, IUploadProgressReportProps>({
        mutationFn: (data: IUploadProgressReportProps) => uploadProgressReportService(data.reportID, data.data)
    })
}

type voteReportParams = {
    reportID: number;
    data: IVoteReportRequest;
}

export const useVoteReport = () => {
    return useMutation<IVoteReportResponse, Error, voteReportParams>({
        mutationFn: ({ reportID, data }) => voteReportService(reportID, data),
    });
};
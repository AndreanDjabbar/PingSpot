import { createReportCommentService } from "@/services/mainService"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ICreateReportCommentResponse } from "@/types/api/report"

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
        },
    })
}
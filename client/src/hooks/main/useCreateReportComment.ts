import { createReportCommentService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"
import { ICreateReportCommentResponse } from "@/types/api/report"

interface ICreateReportCommentProps {
    reportID: number;
    data: FormData;
}

export const useCreateReportCommentReport = () => {
    return useMutation<ICreateReportCommentResponse, Error, ICreateReportCommentProps>({
        mutationFn: (data: ICreateReportCommentProps) => createReportCommentService(data.reportID, data.data)
    })
}
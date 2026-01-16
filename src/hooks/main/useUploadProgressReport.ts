import { uploadProgressReportService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"
import { IUploadProgressReportResponse } from "@/types/api/report"

interface IUploadProgressReportProps {
    reportID: number;
    data: FormData;
}

export const useUploadProgressReport = () => {
    return useMutation<IUploadProgressReportResponse, Error, IUploadProgressReportProps>({
        mutationFn: (data: IUploadProgressReportProps) => uploadProgressReportService(data.reportID, data.data)
    })
}
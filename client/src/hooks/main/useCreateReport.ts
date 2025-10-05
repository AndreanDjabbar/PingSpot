import { createReportService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"
import { ICreateReportResponse } from "@/types/api/report"

export const useCreateReport = () => {
    return useMutation<ICreateReportResponse, Error, FormData>({
        mutationFn: (data: FormData) => createReportService(data)
    })
}
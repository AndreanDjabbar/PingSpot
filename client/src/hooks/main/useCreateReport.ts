import { createReportService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"

export const useCreateReport = () => {
    return useMutation<unknown, Error, FormData>({
        mutationFn: (data: FormData) => createReportService(data)
    })
}
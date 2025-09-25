import { getReportService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"

export const useGetReport = () => {
    return useMutation<unknown, Error>({
        mutationFn: () => getReportService()
    })
}
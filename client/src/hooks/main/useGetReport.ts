import { getReportService } from "@/services/mainService"
import { useQuery } from "@tanstack/react-query"
import { IGetReportResponse } from "@/types/api/report"

export const useGetReport = () => {
    return useQuery<IGetReportResponse, Error>({
        queryFn: () => getReportService(),
        queryKey: ['report'],
    })
}
import { getReportService } from "@/services/mainService"
import { useQuery } from "@tanstack/react-query"
import { IGetReportResponse } from "@/types/response/mainTypes"

export const useGetReport = () => {
    return useQuery<IGetReportResponse, Error>({
        queryFn: () => getReportService(),
        queryKey: ['report'],
    })
}
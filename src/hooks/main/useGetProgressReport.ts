import { getProgressReportService } from "@/services/mainService";
import { useQuery } from "@tanstack/react-query";
import { IGetProgressReportResponse } from "@/types/api/report";

export const useGetProgressReport = (reportID: number) => {
    return useQuery<IGetProgressReportResponse, Error>({
        queryKey: ['report-progress', reportID],
        queryFn: () => getProgressReportService(reportID),
    });
};

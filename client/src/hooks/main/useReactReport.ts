import { reactReportService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"
import { IReactReportRequest, IReactReportResponse } from "@/types/api/report";

type reactReportParams = {
    reportID: number;
    data: IReactReportRequest;
}

export const useReactReport = () => {
    return useMutation<IReactReportResponse, Error, reactReportParams>({
        mutationFn: ({ reportID, data }) => reactReportService(reportID, data),
    });
};
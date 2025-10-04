import { reactReportService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"
import { IReactReportFormType } from "@/app/main/schema"
import { IReactReportResponse } from "@/types/response/mainTypes";

type reactReportParams = {
    reportID: number;
    data: IReactReportFormType;
}

export const useReactReport = () => {
    return useMutation<IReactReportResponse, Error, reactReportParams>({
        mutationFn: ({ reportID, data }) => reactReportService(reportID, data),
    });
};
import { reactReportService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"
import { IReactReportFormType } from "@/app/main/schema"

type reactReportParams = {
    reportID: number;
    data: IReactReportFormType;
}

export const useReactReport = () => {
    return useMutation<unknown, Error, reactReportParams>({
        mutationFn: ({ reportID, data }) => reactReportService(reportID, data),
    });
};
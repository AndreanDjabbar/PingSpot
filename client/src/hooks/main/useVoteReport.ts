import { voteReportService } from "@/services/mainService"
import { useMutation } from "@tanstack/react-query"
import { IVoteReportRequest, IVoteReportResponse } from "@/types/api/report";

type voteReportParams = {
    reportID: number;
    data: IVoteReportRequest;
}

export const useVoteReport = () => {
    return useMutation<IVoteReportResponse, Error, voteReportParams>({
        mutationFn: ({ reportID, data }) => voteReportService(reportID, data),
    });
};
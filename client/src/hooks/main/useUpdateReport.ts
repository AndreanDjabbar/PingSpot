import { useMutation } from '@tanstack/react-query';
import { updateReportService } from '@/services/mainService';
import { ICreateReportResponse } from '@/types/api/report';

interface IUpdateReportProps {
    reportID: number;
    data: FormData;
}

export const useUpdateReport = () => {
    return useMutation<ICreateReportResponse, Error, IUpdateReportProps>({
        mutationFn: (payload: IUpdateReportProps) => updateReportService(payload.reportID, payload.data)
    })
}

export default useUpdateReport;

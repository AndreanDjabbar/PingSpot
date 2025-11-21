import { useMutation } from '@tanstack/react-query';
import { EditReportService } from '@/services/mainService';
import { IEditReportResponse } from '@/types/api/report';

interface IEditReportProps {
    reportID: number;
    data: FormData;
}

export const useEditReport = () => {
    return useMutation<IEditReportResponse, Error, IEditReportProps>({
        mutationFn: (payload: IEditReportProps) => EditReportService(payload.reportID, payload.data)
    })
}
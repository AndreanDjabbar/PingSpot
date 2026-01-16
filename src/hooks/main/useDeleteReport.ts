import { useMutation } from '@tanstack/react-query';
import { DeleteReportService } from '@/services/mainService';
import { IDeleteReportRequest, IDeleteReportResponse } from '@/types/api/report';

export const useDeleteReport = () => {
    return useMutation<IDeleteReportResponse, Error, IDeleteReportRequest>({
        mutationFn: (payload: IDeleteReportRequest) => DeleteReportService(payload)
    })
}

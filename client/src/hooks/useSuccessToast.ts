/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import { useToast } from '@/hooks/useToast';
import { getDataResponseMessage } from '@/utils/getDataResponse';

const useSuccessToast = (isSuccess: boolean, data: any) => {
    const { toastSuccess } = useToast();

    useEffect(() => {
        if (isSuccess && data) {
            toastSuccess(getDataResponseMessage(data) || 'Operasi berhasil');
        }
    }, [isSuccess, data, toastSuccess]);

}

export default useSuccessToast
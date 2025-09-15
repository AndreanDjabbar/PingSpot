/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'
import { useToast } from '@/hooks/useToast';
import { getDataResponseMessage } from '@/utils/getDataResponse';

const useSuccessToast = (isSuccess: boolean, data: any) => {
    const { toastSuccess } = useToast();
    const successRef = useRef<string | null>(null);

    useEffect(() => {
        if (isSuccess && data) {
            const currentSuccess = getDataResponseMessage(data) || 'Operasi berhasil';
            if (successRef.current !== currentSuccess) {
                toastSuccess(getDataResponseMessage(data) || 'Operasi berhasil');
                successRef.current = currentSuccess;
            }
            if (!isSuccess) {
                successRef.current = null;
            }
        }
    }, [isSuccess, data, toastSuccess]);

}

export default useSuccessToast
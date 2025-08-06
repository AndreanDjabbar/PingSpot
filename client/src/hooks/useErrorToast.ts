/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'
import { getErrorResponseMessage } from '@/utils/gerErrorResponse';
import { useToast } from '@/hooks/useToast';

const useErrorToast = (isError: boolean, error: any) => {
    const { toastError } = useToast();
    const errorRef = useRef<string | null>(null);

    useEffect(() => {
        if (isError && error) {
            const currentError = getErrorResponseMessage(error);
            if (errorRef.current !== currentError) {
                toastError(currentError);
                errorRef.current = currentError;
            }
        }
        if (!isError) {
            errorRef.current = null;
        }
    }, [isError, error, toastError])

}

export default useErrorToast
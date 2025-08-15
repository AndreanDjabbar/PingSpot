/* eslint-disable @typescript-eslint/no-explicit-any */

type IDataResponse = {
    message: string;
    data?: any;
}

export const getDataResponseMessage = (data: any): string => {
    if (data) {
        return (data as IDataResponse).message || "No message available.";
    }
    return "No data provided.";
}

export const getDataResponseDetails = (data: any): any => {
    if (data) {
        return (data as IDataResponse).data || data || null;
    }
    return null;
}
import axiosInstance from "@/lib/axiosInstance";
import { ISearchDataResponse } from "@/types/api/search";

export const searchDataService = async (searchQuery: string, usersDatacursorID?: number, reportsDataCursorID?: number): Promise<ISearchDataResponse> => {
    const params = new URLSearchParams();

    if (usersDatacursorID) params.append('usersDataCursorID', usersDatacursorID.toString());
    if (reportsDataCursorID) params.append('reportsDataCursorID', reportsDataCursorID.toString());
    params.append('searchQuery', searchQuery);
    const queryString = params.toString() ? `&${params.toString()}` : '';
    const response = await axiosInstance.get<ISearchDataResponse>(`/search/?${queryString}`);
    return response.data;
}
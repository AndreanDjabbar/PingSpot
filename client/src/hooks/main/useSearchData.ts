import { useDebounce } from 'use-debounce';
import { searchDataService } from "@/services/mainService";
import { useInfiniteQuery } from "@tanstack/react-query"
import { ISearchDataResponse } from "@/types/api/search";

interface SearchPageParam {
    usersDataCursorID?: number;
    reportsDataCursorID?: number;
}

export const useSearchData = (searchQuery: string) => {
    const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
    
    return useInfiniteQuery<ISearchDataResponse, Error>({
        queryKey: ['search', debouncedSearchQuery],
        queryFn: ({ pageParam }) => {
            const params = pageParam as SearchPageParam | undefined;
            return searchDataService(
                debouncedSearchQuery,
                params?.usersDataCursorID,
                params?.reportsDataCursorID
            );
        },
        getNextPageParam: (lastPage) => {
            const nextUsersID = lastPage.data?.nextCursorUsersData;
            const nextReportsID = lastPage.data?.nextCursorReportsData;
            
            if (!nextUsersID && !nextReportsID) {
                return undefined;
            }
            
            return {
                usersDataCursorID: nextUsersID,
                reportsDataCursorID: nextReportsID,
            };
        },
        initialPageParam: undefined,
        enabled: debouncedSearchQuery.trim().length >= 3,
    });
};
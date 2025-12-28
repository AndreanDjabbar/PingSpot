"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import HeaderSection from '../components/HeaderSection';
import { ExploreSearch, ExploreSearchNonModal } from './components';
import { useSearchData } from '@/hooks/main';
import { useQueryClient } from '@tanstack/react-query';

const ExplorePage = () => {
    const currentPath = usePathname();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchNonModalOpen, setIsSearchNonModalOpen] = useState(false);

    const { 
        data: searchData, 
        fetchNextPage: fetchNextSearchPage, 
        hasNextPage: hasNextSearchPage, 
        isFetching: isFetchingSearch, 
        isLoading: isLoadingSearch,
        isError: isErrorSearch,
        error: errorSearch
    } = useSearchData(searchTerm);
    const queryClient = useQueryClient();

    const resultsSearchData = searchData?.pages.flatMap(page => page) || null;

    const reportsData = resultsSearchData?.flatMap(page => page.data?.reportsData.reports || []) || [];
    const usersData = resultsSearchData?.flatMap(page => page.data?.usersData.users || []) || [];
    

    const flattenedSearchData = {
        usersData: {
            users: usersData,
            type: "users"
        },
        reportsData: {
            reports: reportsData,
            type: "reports"
        },
    }

    const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    if (value.trim().length < 3) {
        queryClient.removeQueries({ queryKey: ['search'] });
        if (value.trim().length === 0) {
            setIsSearchNonModalOpen(false);
        }
    } else {
        setIsSearchNonModalOpen(true);
    }
};

    return (
        <div className=''>
            <div className='flex flex-col space-y-4'>
                <div className='flex gap-6 lg:gap-8 '>
                    <div className="flex-1 space-y-4">
                        <HeaderSection 
                            currentPath={currentPath || '/main/explore'}
                            message='Jelajahi pengguna, laporan, dan komunitas yang ada di PingSpot untuk terhubung dan berkolaborasi dalam meningkatkan lingkungan bersama.'
                        />
                    </div>
                </div>
                <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-4 relative gap-2 flex flex-col'>
                    <ExploreSearch 
                        onSearchChange={handleSearchChange}
                        searchTerm={searchTerm}
                        onNonModalClose={() => setIsSearchNonModalOpen(false)}
                        isNonModalOpen={isSearchNonModalOpen}
                        onSearchClick={() => setIsSearchNonModalOpen(true)}
                        isLoading={isLoadingSearch}
                    />
                    <ExploreSearchNonModal 
                        searchTerm={searchTerm}
                        hasNextPage={hasNextSearchPage}
                        isFetchingNextPage={isFetchingSearch}
                        fetchNextPage={fetchNextSearchPage}
                        searchData={flattenedSearchData || null}
                        isOpen={isSearchNonModalOpen}
                        onClose={() => setIsSearchNonModalOpen(false)}
                        onSearchChange={handleSearchChange}
                        isLoading={isLoadingSearch}
                        isError={isErrorSearch}
                        error={errorSearch}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExplorePage;
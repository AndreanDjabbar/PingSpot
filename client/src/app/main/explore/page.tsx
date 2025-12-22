"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import HeaderSection from '../components/HeaderSection';
import { ExploreSearch, ExploreSearchNonModal } from './components';

const ExplorePage = () => {
    const currentPath = usePathname();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    return (
        <div className=''>
            <div className='flex flex-col space-y-4'>
                <div className='flex gap-6 lg:gap-8 '>
                    <div className="flex-1 space-y-4">
                        <HeaderSection currentPath={currentPath || '/main/explore'}
                        message='Jelajahi pengguna, laporan, dan komunitas yang ada di PingSpot untuk terhubung dan berkolaborasi dalam meningkatkan lingkungan bersama.'/>
                    </div>
                </div>
                <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-4 relative gap-2 flex flex-col'>
                    <ExploreSearch 
                        onSearchChange={setSearchTerm}
                        searchTerm={searchTerm}
                        onNonModalClose={() => setIsSearchModalOpen(false)}
                        isNonModalOpen={isSearchModalOpen}
                        onSearchClick={() => setIsSearchModalOpen(true)}
                    />
                    <ExploreSearchNonModal 
                        searchTerm={searchTerm}
                        isOpen={isSearchModalOpen}
                        onClose={() => setIsSearchModalOpen(false)}
                        onSearchChange={setSearchTerm}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExplorePage;
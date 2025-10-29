import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoFunnelOutline } from 'react-icons/io5';
import { InputField } from '@/components/form';

interface ReportSearchAndFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onFilterClick: () => void;
    activeFiltersCount?: number;
    filterButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const ReportSearchAndFilter: React.FC<ReportSearchAndFilterProps> = ({
    searchTerm,
    onSearchChange,
    onFilterClick,
    activeFiltersCount = 0,
    filterButtonRef
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                    <InputField
                    id="search"
                    placeHolder='Cari laporan berdasarkan judul, deskripsi atau lokasi'
                    icon={<FaSearch size={15} />}
                    withLabel={false}
                    />
                </div>
                    
                <button
                    ref={filterButtonRef}
                    onClick={onFilterClick}
                    className="relative flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:text-gray-700 font-medium whitespace-nowrap active:bg-gray-200"
                >
                    <IoFunnelOutline className="w-5 h-5" />
                    <span>Filter</span>
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-sky-600 rounded-full border-2 border-white">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReportSearchAndFilter;
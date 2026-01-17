import React from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { InputField } from '@/components/form';
import { BiX } from 'react-icons/bi';

interface ExploreSearchProps {
    searchTerm: string;
    isNonModalOpen: boolean;
    onNonModalClose: () => void;
    onSearchChange: (value: string) => void;
    onSearchClick: () => void;
    isLoading?: boolean;
}

const ExploreSearch: React.FC<ExploreSearchProps> = ({
    searchTerm,
    onSearchChange,
    isNonModalOpen,
    onNonModalClose,
    onSearchClick,
    isLoading = false
}) => {
    return (
        <div className="">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex w-full gap-2" onClick={onSearchClick}>
                    <div className='w-full relative'>
                        <InputField
                            id="search"
                            type='text'
                            isUseAutoComplete={false}
                            placeHolder='Cari pengguna, laporan, atau komunitas'
                            icon={(isLoading && searchTerm.length >= 3) ? <FaSpinner className="animate-spin" size={15} /> : <FaSearch size={15} />}
                            withLabel={false}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    {isNonModalOpen && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onNonModalClose();
                            }}
                            className="p-2 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors duration-200 group"
                            aria-label="Close search"
                        >
                            <BiX size={24} className="text-gray-500 group-hover:text-gray-700 hover:cursor-pointer" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExploreSearch;
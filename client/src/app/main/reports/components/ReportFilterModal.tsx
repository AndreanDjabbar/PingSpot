import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiLike, BiCategory, BiMap } from 'react-icons/bi';
import { MdCheckCircle, MdAccessTime, MdCancel } from 'react-icons/md';
import { ReportType } from '@/types/model/report';

type SortOption = 'latest' | 'oldest' | 'most_liked' | 'least_liked';
type StatusFilter = 'all' | 'PENDING' | 'ON_PROGRESS' | 'RESOLVED' | 'NOT_RESOLVED';
type DistanceFilter = 'all' | '1km' | '5km' | '10km';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions) => void;
    currentFilters: FilterOptions;
    buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export interface FilterOptions {
    sortBy: SortOption;
    reportType: ReportType | 'all';
    status: StatusFilter;
    distance: DistanceFilter;
}

const ReportFilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    currentFilters,
    buttonRef
}) => {
    const [filters, setFilters] = useState<FilterOptions>(currentFilters);
    const [position, setPosition] = useState({ top: 0, right: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && buttonRef?.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            // returns the size and position of an element relative to the viewport (visible area of the browser window). ex:
            // {
            //     x: 100,
            //     y: 200,
            //     width: 150,
            //     height: 40,
            //     top: 200,
            //     right: 250,
            //     bottom: 240,
            //     left: 100
            // }
            
            const scrollY = window.scrollY;
            // returns the number of pixels the document has been scrolled vertically from the very top. (how far the page has been scrolled vertically).
            
            setPosition({
                top: buttonRect.bottom + scrollY + 8,
                right: window.innerWidth - buttonRect.right,
            });
            // window.innerWidth: returns the number of pixels between the left and right edges of the visible part of the browser window (excluding scrollbars, toolbars, etc.).
        }
    }, [isOpen, buttonRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current && 
                !modalRef.current.contains(event.target as Node) &&
                buttonRef?.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, buttonRef]);

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        const defaultFilters: FilterOptions = {
            sortBy: 'latest',
            reportType: 'all',
            status: 'all',
            distance: 'all'
        };
        setFilters(defaultFilters);
    };

    const sortOptions = [
        { value: 'latest', label: 'Terbaru', icon: <MdAccessTime /> },
        { value: 'oldest', label: 'Terlama', icon: <MdAccessTime /> },
        { value: 'most_liked', label: 'Paling Disukai', icon: <BiLike /> },
    ];

    const reportTypeOptions = [
        { value: 'INFRASTRUCTURE', label: 'Infrastruktur' },
        { value: 'ENVIRONMENT', label: 'Lingkungan' },
        { value: 'SAFETY', label: 'Keamanan' },
        { value: 'TRAFFIC', label: 'Lalu Lintas' },
        { value: 'PUBLIC_FACILITY', label: 'Fasilitas Umum' },
        { value: 'WASTE', label: 'Sampah' },
        { value: 'WATER', label: 'Air' },
        { value: 'ELECTRICITY', label: 'Listrik' },
        { value: 'HEALTH', label: 'Kesehatan' },
        { value: 'SOCIAL', label: 'Sosial' },
        { value: 'EDUCATION', label: 'Pendidikan' },
        { value: 'ADMINISTRATIVE', label: 'Administrasi' },
        { value: 'DISASTER', label: 'Bencana Alam' },
        { value: 'OTHER', label: 'Lainnya' },
    ];

    const statusOptions = [
        { value: 'all', label: 'Semua Status', icon: <BiCategory />, color: 'gray' },
        { value: 'ON_PROGRESS', label: 'Dalam Proses', icon: <MdAccessTime />, color: 'yellow' },
        { value: 'RESOLVED', label: 'Terselesaikan', icon: <MdCheckCircle />, color: 'green' },
        { value: 'NOT_RESOLVED', label: 'Belum Terselesaikan', icon: <MdCancel />, color: 'red' },
    ];

    const distanceOptions = [
        { value: 'all', label: 'Semua Lokasi', icon: <BiMap /> },
        { value: '1km', label: 'Dalam 1 km', icon: <BiMap /> },
        { value: '5km', label: 'Dalam 5 km', icon: <BiMap /> },
        { value: '10km', label: 'Dalam 10 km', icon: <BiMap /> },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                    />
                    {/* 
                    opacity: 0	Fully transparent	invisible
                    opacity: 0.5	50% transparent	semi-visible
                    opacity: 1	Fully opaque	fully visible

                    y: -10 → move up 10px
                    y: 0 → no offset, element is exactly where it should be 
                    y: 10 → move down 10px
                    
                    */}

                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: `${position.top}px`,
                            right: `${position.right}px`,
                        }}
                        className="z-50 w-full max-w-md sm:max-w-lg lg:max-w-2xl "
                    >
                        <div 
                            className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-200"
                        />
                        
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-75 sm:h-78 md:h-95 lg:h-105 xl:h-120">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                        <BiLike className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Urutkan Berdasarkan
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setFilters({ ...filters, sortBy: option.value as SortOption })}
                                                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                                                    filters.sortBy === option.value
                                                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                <span className={filters.sortBy === option.value ? 'text-sky-600' : 'text-gray-400'}>
                                                    {option.icon}
                                                </span>
                                                <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                        <BiCategory className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Tipe Laporan
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                        {reportTypeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setFilters({ ...filters, reportType: option.value as ReportType | 'all' })}
                                                className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium ${
                                                    filters.reportType === option.value
                                                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                        <MdCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Status Laporan
                                    </label>
                                    <div className="space-y-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setFilters({ ...filters, status: option.value as StatusFilter })}
                                                className={`w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                                                    filters.status === option.value
                                                        ? 'border-sky-600 bg-sky-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className={`text-base sm:text-lg ${
                                                    filters.status === option.value
                                                        ? 'text-sky-600'
                                                        : option.color === 'green'
                                                        ? 'text-green-500'
                                                        : option.color === 'blue'
                                                        ? 'text-blue-500'
                                                        : option.color === 'yellow'
                                                        ? 'text-yellow-500'
                                                        : option.color === 'red'
                                                        ? 'text-red-500'
                                                        : 'text-gray-400'
                                                }`}>
                                                    {option.icon}
                                                </span>
                                                <span className={`text-xs sm:text-sm font-medium ${
                                                    filters.status === option.value ? 'text-sky-700' : 'text-gray-700'
                                                }`}>
                                                    {option.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                        <BiMap className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Jarak Lokasi
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        {distanceOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setFilters({ ...filters, distance: option.value as DistanceFilter })}
                                                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                                                    filters.distance === option.value
                                                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                <span className={filters.distance === option.value ? 'text-sky-600' : 'text-gray-400'}>
                                                    {option.icon}
                                                </span>
                                                <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex gap-2 sm:gap-3">
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 text-sm sm:text-base font-semibold hover:bg-gray-100 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleApply}
                                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-sky-700 text-white text-sm sm:text-base font-semibold hover:bg-sky-800 transition-colors shadow-lg shadow-sky-700/30"
                                    >
                                        Terapkan Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReportFilterModal;

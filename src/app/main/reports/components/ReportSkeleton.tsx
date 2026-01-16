import React from 'react';
import { Breadcrumb } from '@/components/layouts';
import { BiPlus } from 'react-icons/bi';

interface LoadingStateProps {
    currentPath: string;
}

const ReportSkeleton: React.FC<LoadingStateProps> = ({ currentPath }) => {
    return (
        <div className="">
            <div className="flex gap-6 lg:gap-8">
                <div className="flex-1 space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex flex-col gap-3">
                                <Breadcrumb path={currentPath} />
                                <p className="text-gray-600 text-sm">
                                    Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.
                                </p>
                            </div>
                            <button 
                                disabled
                                className="bg-sky-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm flex items-center justify-center space-x-2 whitespace-nowrap opacity-60 cursor-not-allowed"
                            >
                                <BiPlus className="w-5 h-5" />
                                <span>Buat Laporan</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter Skeleton */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                        <div className="animate-pulse">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                                <div className="flex gap-2">
                                    <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                                    <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                                    <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                                    <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-10 lg:gap-5">
                        <div className="w-full xl:w-2/3 lg:w-160">
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="animate-pulse">
                                            <div className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                                                        <div className="space-y-2">
                                                            <div className="h-3.5 bg-gray-300 rounded w-24"></div>
                                                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                                                        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-4 pb-3 space-y-2">
                                                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                            </div>

                                            <div className="px-4 pb-3">
                                                <div className="flex items-center justify-center">
                                                    <div className="inline-flex items-center w-full max-w-md rounded-lg overflow-hidden">
                                                        <div className="flex-1 h-9 bg-gray-300 rounded-l-lg"></div>
                                                        <div className="flex-1 h-9 bg-gray-200 rounded-r-lg"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full px-4 pb-4">
                                                <div className="relative h-[380px] bg-gray-200 rounded-xl"></div>
                                                <div className="mt-4 bg-gray-100 rounded-lg p-4">
                                                    <div className="flex items-start gap-2">
                                                        <div className="h-4 w-4 bg-gray-300 rounded mt-0.5"></div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-6">
                                                        <div className="h-5 w-12 bg-gray-300 rounded"></div>
                                                        <div className="h-5 w-12 bg-gray-300 rounded"></div>
                                                        <div className="h-5 w-12 bg-gray-300 rounded"></div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="h-5 w-5 bg-gray-300 rounded"></div>
                                                        <div className="h-5 w-5 bg-gray-300 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {i === 1 && (
                                                <div className="border-t border-gray-200 p-4">
                                                    <div className="space-y-3">
                                                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                                                            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                                                            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hidden xl:block xl:w-1/3">
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-6 bg-gray-300 rounded w-32"></div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-6 bg-gray-300 rounded w-32"></div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-6 bg-gray-300 rounded w-32"></div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSkeleton;
import React from 'react';

const ReportDetailSkeleton = () => {
    return (
        <div className="min-h-screen">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className='flex flex-col gap-3'>
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="animate-pulse">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                                            </div>
                                        </div>
                                        <div className="h-7 w-24 bg-gray-300 rounded-full"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-7 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="inline-flex items-center w-full max-w-md rounded-lg overflow-hidden">
                                            <div className="flex-1 h-10 bg-gray-300 rounded-l-lg"></div>
                                            <div className="flex-1 h-10 bg-gray-200 rounded-r-lg"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="relative h-[500px] bg-gray-200 rounded-xl mb-4"></div>
                                    
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <div className="h-5 w-5 bg-gray-300 rounded mt-0.5"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-8">
                                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="h-6 w-6 bg-gray-300 rounded"></div>
                                            <div className="h-6 w-6 bg-gray-300 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-300 rounded w-32 mb-6"></div>
                                
                                <div className="mb-6">
                                    <div className="h-24 bg-gray-200 rounded-lg mb-3"></div>
                                    <div className="h-10 w-32 bg-gray-300 rounded-lg ml-auto"></div>
                                </div>

                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="flex gap-3">
                                            <div className="h-10 w-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                                <div className="flex gap-4 mt-3">
                                                    <div className="h-3 w-12 bg-gray-200 rounded"></div>
                                                    <div className="h-3 w-12 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-300 rounded w-28"></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                                                {i !== 2 && <div className="w-0.5 h-16 bg-gray-200 my-1"></div>}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
                                
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                                            <div className="h-3 bg-gray-200 rounded w-10"></div>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                                            <div className="h-3 bg-gray-200 rounded w-10"></div>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="h-3 bg-gray-200 rounded w-28"></div>
                                            <div className="h-3 bg-gray-200 rounded w-10"></div>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="h-10 bg-gray-200 rounded-lg"></div>
                                        <div className="h-10 bg-gray-200 rounded-lg"></div>
                                        <div className="h-10 bg-gray-200 rounded-lg"></div>
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

export default ReportDetailSkeleton;

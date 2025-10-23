export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                
                                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            
                            <div className="px-6 pb-6">
                                <div className="h-[480px] bg-gray-200 rounded-xl animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import HeaderSection from '@/app/main/components/HeaderSection';

interface LoadingStateProps {
    currentPath: string;
}

const ReportSkeleton: React.FC<LoadingStateProps> = ({ currentPath }) => {
    return (
        <div className="space-y-8">
            <HeaderSection 
                currentPath={currentPath}
                message='Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.'
            >
                <div className="bg-gray-300 animate-pulse px-8 py-4 rounded-xl">
                <div className="h-6 w-40 bg-gray-400 rounded"></div>
                </div>
            </HeaderSection>
            
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6">
                    <div className="animate-pulse">
                    <div className="flex items-center mb-4">
                        <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="ml-auto h-6 w-20 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-[200px] bg-gray-200 rounded-lg"></div>
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
};

export default ReportSkeleton;
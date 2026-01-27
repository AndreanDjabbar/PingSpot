import { IReportProgress } from "@/types/model/report"
import { getFormattedDate, getImageURL } from "@/utils";
import Image from "next/image";
import React from "react"
import { BiX } from "react-icons/bi";
import { MdDone } from "react-icons/md";
import { RiProgress3Fill } from "react-icons/ri";

interface ProgressHistoryProps {
    reportProgress: IReportProgress[];
    handleImageClick: (imageUrl: string) => void;
}

const ProgressHistory: React.FC<ProgressHistoryProps> = ({
    reportProgress,
    handleImageClick,
}) => {
    const onImageClick = (imageUrl: string) => {
        handleImageClick(imageUrl);
    }

    return (
        <div>
            <div className="max-h-[500px] overflow-y-auto  mt-2">
                <div className="space-y-4">
                    <div className="relative">
                        {reportProgress.map((progress, index) => {
                            const isLast = index === reportProgress.length - 1;
                            const progressImages = [
                                progress.attachment1,
                                progress.attachment2
                            ].filter((url): url is string => typeof url === 'string' && url.length > 0);
                            
                            return (
                                <div key={`${progress.id}-${index}`} className="relative pb-6">
                                    {!isLast && (
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-gray-200"></div>
                                    )}
                                    
                                    <div className="flex items-start gap-3">
                                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                            progress.status === 'RESOLVED' 
                                                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                                                : progress.status === 'ON_PROGRESS'
                                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                                : 'bg-gradient-to-br from-red-400 to-red-600'
                                        }`}>
                                            {progress.status === 'RESOLVED' ? (
                                                <MdDone className='text-white' size={20}/>
                                            ) : progress.status === 'ON_PROGRESS' ? (
                                                <RiProgress3Fill className='text-white' size={20}/>
                                            ) : (
                                                <BiX className='text-white' size={20}/>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className={`rounded-lg p-3 border ${
                                                progress.status === 'RESOLVED' 
                                                    ? 'bg-green-50 border-green-200' 
                                                    : progress.status === 'ON_PROGRESS'
                                                    ? 'bg-yellow-50 border-yellow-200'
                                                    : 'bg-red-50 border-red-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2 lg:flex-col lg:items-start 2xl:flex-row">
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${
                                                        progress.status === 'RESOLVED' 
                                                            ? 'text-green-700' 
                                                            : progress.status === 'ON_PROGRESS'
                                                            ? 'text-yellow-700'
                                                            : 'text-red-700'
                                                    }`}>
                                                        {progress.status === 'RESOLVED' 
                                                            ? 'Terselesaikan' 
                                                            : progress.status === 'ON_PROGRESS'
                                                            ? 'Dalam Proses'
                                                            : 'Tidak Ada Proses'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {getFormattedDate(progress.createdAt, {
                                                            formatStr: 'dd MMM yyyy - HH:mm',
                                                        })}
                                                    </span>
                                                </div>
                                                
                                                {progress.notes && (
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {progress.notes}
                                                    </p>
                                                )}
                                                
                                                {progressImages.length > 0 && (
                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        {progressImages.map((imageUrl, imgIndex) => (
                                                            <div 
                                                                key={`${imgIndex}-${index}`}
                                                                className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => onImageClick(`report/progress/${imageUrl}`)}
                                                            >
                                                                <Image
                                                                    src={getImageURL(`/report/progress/${imageUrl}`, "main")}
                                                                    alt={`Progress ${index + 1} - Image ${imgIndex + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProgressHistory
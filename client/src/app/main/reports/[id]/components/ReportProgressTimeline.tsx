"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BiEdit, BiX } from 'react-icons/bi';
import { IoDocumentText } from 'react-icons/io5';
import { IReport } from '@/types/model/report';
import { getFormattedDate as formattedDate, getImageURL } from '@/utils';
import { Accordion } from '@/components/UI';
import { RiProgress3Fill } from 'react-icons/ri';
import { MdDone } from 'react-icons/md';
import { LuLock } from 'react-icons/lu';

interface ReportProgressTimelineProps {
    report: IReport;
    isReportOwner: boolean;
    onImageClick: (imageURL: string) => void;
}

export const ReportProgressTimeline: React.FC<ReportProgressTimelineProps> = ({ 
    report, 
    isReportOwner,
    onImageClick 
}) => {
    const router = useRouter();

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Perkembangan Laporan</h3>
                {isReportOwner && report.hasProgress && (
                    <button
                        onClick={() => router.push(`/main/reports/${report.id}/update-progress`)}
                        className="flex items-center gap-2 px-4 py-2 bg-pingspot-hoverable text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md cursor-pointer"
                    >
                        <BiEdit size={16} />
                        <span>Perbarui</span>
                    </button>
                )}
            </div>
            
            {report.reportProgress && report.reportProgress.length > 0 ? (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        {(() => {
                            const latestProgress = report.reportProgress[0];
                            const latestImages = [
                                latestProgress.attachment1,
                                latestProgress.attachment2
                            ].filter((url): url is string => typeof url === 'string' && url.length > 0);
                            
                            return (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-bold text-sky-700 uppercase tracking-wide">Perkembangan Terakhir</p>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                            latestProgress.status === 'RESOLVED' 
                                                ? 'bg-green-100 text-green-800' 
                                                : latestProgress.status === 'ON_PROGRESS'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {latestProgress.status === 'RESOLVED' 
                                                ? 'Terselesaikan' 
                                                : latestProgress.status === 'ON_PROGRESS'
                                                ? 'Dalam Proses'
                                                : 'Tidak Ada Proses'}
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 mb-2">
                                        {formattedDate(latestProgress.createdAt, {
                                            formatStr: 'dd MMMM yyyy - HH:mm',
                                        })}
                                    </p>
                                    
                                    {latestProgress.notes && (
                                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                            {latestProgress.notes}
                                        </p>
                                    )}
                                    
                                    {latestImages.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {latestImages.map((imageUrl, imgIndex) => (
                                                <div 
                                                    key={imgIndex}
                                                    className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => onImageClick(imageUrl)}
                                                >
                                                    <Image
                                                        src={getImageURL(`/report/progress/${imageUrl}`, "main")}
                                                        alt={`Latest progress - Image ${imgIndex + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {report.reportProgress.length > 1 && (
                        <Accordion type="single" defaultValue={[]}>
                            <Accordion.Item id="progress-history" title={`Riwayat Perkembangan (${report.reportProgress.length})`}>
                                <div className="max-h-[500px] overflow-y-auto  mt-2">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            {report.reportProgress.map((progress, index) => {
                                                const isLast = index === report.reportProgress.length - 1;
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
                                                                            {formattedDate(progress.createdAt, {
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
                                                                                    onClick={() => onImageClick(imageUrl)}
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
                            </Accordion.Item>
                        </Accordion>
                    )}
                </div>
            ) : (
                <div>
                    {report.hasProgress ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                                <IoDocumentText size={32}/>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Belum Ada Perkembangan</p>
                            <p className="text-xs text-gray-500">
                                Perkembangan laporan akan ditampilkan di sini
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                                <LuLock size={32}/>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Tidak ada Progress</p>
                            <p className="text-xs text-gray-500">
                                Tipe laporan ini tidak akan menampilkan perkembangan laporan
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

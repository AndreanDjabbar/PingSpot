import React from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa';
import { RiProgress3Fill } from 'react-icons/ri';

interface PublicVotesProps {
    totalVotes: number;
    totalResolvedVotes: number;
    totalOnProgressVotes: number;
    totalNotResolvedVotes: number;
}

const PublicVotes: React.FC<PublicVotesProps> = ({
    totalVotes,
    totalResolvedVotes,
    totalOnProgressVotes,
    totalNotResolvedVotes,
}) => {
    const resolvedPercentage = totalVotes > 0 ? (totalResolvedVotes / totalVotes) * 100 : 0;
    const onProgressPercentage = totalVotes > 0 ? (totalOnProgressVotes / totalVotes) * 100 : 0;
    const notResolvedPercentage = totalVotes > 0 ? (totalNotResolvedVotes / totalVotes) * 100 : 0;
    return (
        <div>
            <div className="mb-6 bg-white rounded-xl p-5 border border-gray-200 shadow-md">
                <div className='mb-4'>
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                        <span>Pendapat Komunitas</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                            {totalVotes} vote
                        </span>
                    </div>
                    <span className='text-sm text-gray-600'>Pendapat komunitas mengenai proses perkembangan laporan:</span>
                </div>
                <div className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className='flex gap-2 font-medium text-green-700 items-center'>
                                <FaCheck/>
                                <span className="">Terselesaikan</span>
                            </div>
                            <span className="text-gray-600 font-semibold">{totalResolvedVotes} ({resolvedPercentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                style={{ width: `${resolvedPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className='flex gap-2 font-medium text-yellow-700 items-center'>
                                <RiProgress3Fill/>
                                <span className="">Dalam Proses</span>
                            </div>
                            <span className="text-gray-600 font-semibold">{totalOnProgressVotes} ({onProgressPercentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                style={{ width: `${onProgressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className='flex items-center gap-2 font-medium text-red-700'>
                                <FaTimes/>
                                <span className="">Tidak Ada Proses</span>
                            </div>
                            <span className="text-gray-600 font-semibold">{totalNotResolvedVotes} ({notResolvedPercentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-red-400 to-red-500 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                style={{ width: `${notResolvedPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicVotes
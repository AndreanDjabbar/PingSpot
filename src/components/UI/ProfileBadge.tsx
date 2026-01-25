"use client";

import React from 'react';
import Image from 'next/image';
import { FaUserCircle } from 'react-icons/fa';
import { getImageURL } from '@/utils';

interface ProfileBadgeProps {
    name: string;
    email?: string;
    imageUrl?: string;
    followers?: number;
    following?: number;
    size?: 'sm' | 'md' | 'lg';
    showStats?: boolean;
    onClick?: () => void;
    className?: string;
}

const ProfileBadge: React.FC<ProfileBadgeProps> = ({
    name,
    email,
    imageUrl="",
    followers,
    following,
    size = 'md',
    showStats = true,
    onClick,
    className = '',
}) => {
    const sizeClasses = {
        sm: {
            container: 'gap-2',
            avatar: 'w-10 h-10',
            icon: 'w-6 h-6',
            name: 'text-sm',
            email: 'text-xs',
            stats: 'text-xs',
        },
        md: {
            container: 'gap-3',
            avatar: 'w-12 h-12',
            icon: 'w-7 h-7',
            name: 'text-base',
            email: 'text-sm',
            stats: 'text-xs',
        },
        lg: {
            container: 'gap-4',
            avatar: 'w-16 h-16',
            icon: 'w-10 h-10',
            name: 'text-lg',
            email: 'text-base',
            stats: 'text-sm',
        },
    };

    const currentSize = sizeClasses[size];

    return (
        <div
            className={`flex items-center ${currentSize.container} ${
                onClick ? 'cursor-pointer hover:bg-gray-700/50 rounded-xl p-2 transition-all duration-200' : ''
            } ${className}`}
            onClick={onClick}
        >

            <div className={`${currentSize.avatar} rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-lg flex-shrink-0`}>
                <Image
                    src={getImageURL(imageUrl, 'user')}
                    alt={name}
                    width={size === 'sm' ? 40 : size === 'md' ? 48 : 64}
                    height={size === 'sm' ? 40 : size === 'md' ? 48 : 64}
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className={`${currentSize.name} font-bold text-white truncate`}>
                    {name}
                </div>
                {email && (
                    <div className={`${currentSize.email} text-gray-300 truncate`}>
                        {email}
                    </div>
                )}
                {showStats && (followers !== undefined || following !== undefined) && (
                    <div className={`flex items-center gap-2 ${currentSize.stats} text-gray-400 mt-1`}>
                        {followers !== undefined && (
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-white">{followers}</span>
                                <span>Pengikut</span>
                            </div>
                        )}
                        {followers !== undefined && following !== undefined && (
                            <span className="text-gray-200">•</span>
                        )}
                        {following !== undefined && (
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-white">{following}</span>
                                <span>Mengikuti</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileBadge;

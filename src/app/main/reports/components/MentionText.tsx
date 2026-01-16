"use client";

import React from 'react';
import Link from 'next/link';
import { IUserProfile } from '@/types/model/user';

interface MentionTextProps {
    text: string;
    commentUserID: number;
    className?: string;
    userMentioned: IUserProfile | null;
}

const MentionText: React.FC<MentionTextProps> = ({ 
    text, 
    commentUserID,
    className = "",
    userMentioned 
}) => {
    return (
        <span className={className}>
            {userMentioned && Number(userMentioned.userID) !== commentUserID ? (
                <>
                    <div className='flex gap-1'>
                        <Link
                            href={`/main/profile/${userMentioned.username}`}
                            className="text-sky-600 hover:text-sky-700 font-medium hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            @{userMentioned.username}
                        </Link>
                        {text}
                    </div>
                </>
            ) : (
                <>
                    {text}
                </>
            )}
        </span>
    );
};

export default MentionText;

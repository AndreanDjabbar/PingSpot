"use client";

import React from 'react';
import Link from 'next/link';
import { IUserProfile } from '@/types/model/user';
import { useUserProfileStore } from '@/stores';

interface MentionTextProps {
    text: string;
    className?: string;
    userMentioned: IUserProfile | null;
}

const MentionText: React.FC<MentionTextProps> = ({ 
    text, 
    className = "",
    userMentioned 
}) => {
    const userProfile = useUserProfileStore((state) => state.userProfile);
    const userID = userProfile?.userID;
    return (
        <span className={className}>
            {userMentioned && userMentioned.userID !== userID ? (
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

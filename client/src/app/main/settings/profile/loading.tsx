import React from 'react';
import { Loading } from '@/components/UI';

const ProfileLoading = () => {
    return (
        <div className="">
            <Loading size='xl' className='fixed inset-0 left-0 xl:left-60'/>
        </div>
    );
}

export default ProfileLoading;
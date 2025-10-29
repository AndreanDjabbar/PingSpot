import React from 'react';
import { Loading } from '@/components/UI';

const SettingsLoading = () => {
    return (
        <div className="">
            <Loading size='xl' className='fixed inset-0 left-60'/>
        </div>
    );
}

export default SettingsLoading;
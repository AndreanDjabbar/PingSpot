import React from 'react';
import { Loading } from '@/components';

const SecurityLoading = () => {
    return (
        <div className="">
            <Loading size='xl' className='fixed inset-0 left-0 xl:left-60'/>
        </div>
    );
}

export default SecurityLoading;
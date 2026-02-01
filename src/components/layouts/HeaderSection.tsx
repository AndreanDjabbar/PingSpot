import React from 'react'
import { Breadcrumb } from '@/components';

interface HeaderSectionProps {
    currentPath: string;
    message: string;
    children?: React.ReactNode;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
    currentPath,
    message = "Kelola pengaturan akun dan preferensi Anda di sini.",
    children,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className='flex flex-col gap-3'>
                    <Breadcrumb path={currentPath}/>
                    <p className="text-gray-600 text-sm">
                        {message}
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}

export default HeaderSection

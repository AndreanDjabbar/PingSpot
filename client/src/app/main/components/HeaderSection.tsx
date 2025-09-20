import React from 'react'
import { Breadcrumb } from '@/components/layouts';
import { cn } from '@/lib/utils';

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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
            {!children && (
                <div className={cn("flex flex-col gap-6")}>
                    <Breadcrumb path={currentPath} />
                    <p className="text-gray-600 text-lg">
                        {message}
                    </p>
                </div>
            )}

            {children && (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className='flex flex-col gap-6 justify-between'>
                        <Breadcrumb path={currentPath}/>
                        <p className="text-gray-600 text-lg">
                        {message}
                        </p>
                    </div>
                    {children}
                </div>
            )}
        </div>
    )
}

export default HeaderSection

import React from 'react'
import PingspotLogo from '@/components/PingspotLogo'
import BackgroundTheme from '@/components/BackgroundTheme'
const AuthLayout: React.FC<React.PropsWithChildren> = ({
    children
}) => {
    return (
        <div className="flex h-screen">
            <div className="w-1/2">
                <div className='pt-2'>
                    <PingspotLogo />
                </div>
                <div className='p-4'>
                    {children}
                </div>
            </div>
            <div className="w-1/2 relative">
                <BackgroundTheme/>
            </div>
        </div>
    )
}

export default AuthLayout
import React from 'react'
import PingspotLogo from '@/components/UI/PingspotLogo'
import BackgroundTheme from '@/components/UI/BackgroundTheme'
const AuthLayout: React.FC<React.PropsWithChildren> = ({
    children
}) => {
    return (
        <div className="flex min-h-screen">
            <div className="w-full px-2 sm:px-8 md:px-15 lg:px-10 lg:w-1/2">
                <div className='pt-2'>
                    <PingspotLogo type='icon'/>
                </div>
                <div className='p-4'>
                    {children}
                </div>
            </div>
            <div className="w-1/2 hidden relative lg:block">
                <BackgroundTheme/>
            </div>
        </div>
    )
}

export default AuthLayout
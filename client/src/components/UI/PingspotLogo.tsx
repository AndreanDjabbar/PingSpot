import React from 'react'
import Image from 'next/image'

interface PingspotLogoProps {
    type?: 'primary' | 'secondary'
    size?: string | number;
}

const PingspotLogo: React.FC<PingspotLogoProps> = ({
    type = 'primary',
    size = '150'
}) => {
    return (
        <>
            {type === 'secondary' 
            ? (
                <Image
                src="/images/pingspot-icon-white.svg"
                alt="PingSpot Logo"
                width={Number(size)}
                height={Number(size)}
                className={`w-[${size}px]`}
                />
            )
            : (
                <Image
                src="/images/pingspot-icon.svg"
                alt="PingSpot Logo"
                width={Number(size)}
                height={Number(size)}
                className={`w-[${size}px]`}
                />
            )}
        </>
    )
}

export default PingspotLogo
import React from 'react'
import Image from 'next/image'

interface PingspotLogoProps {
    variant?: 'primary' | 'secondary'
    type?: 'full' | 'semi'
    size?: string | number;
}

const PingspotLogo: React.FC<PingspotLogoProps> = ({
    type = 'full',
    variant = 'primary',
    size = '150'
}) => {

    return (
        <>
            {type === 'semi' ? (
                <>
                    {variant === 'primary' 
                    ? (
                        <Image
                        src="/images/pingspot-semi-primary.svg"
                        alt="PingSpot Logo"
                        width={Number(size)}
                        height={Number(size)}
                        className={`w-[${size}px]`}
                        />
                    )
                    : (
                        <Image
                        src="/images/pingspot-semi-secondary.svg"
                        alt="PingSpot Logo"
                        width={Number(size)}
                        height={Number(size)}
                        className={`w-[${size}px]`}
                        />
                    )}
                </>
            ) : (
                <>
                    {variant === 'primary' 
                    ? (
                        <Image
                        src="/images/pingspot-full-primary.svg"
                        alt="PingSpot Logo"
                        width={Number(size)}
                        height={Number(size)}
                        className={`w-[${size}px]`}
                        />
                    )
                    : (
                        <Image
                        src="/images/pingspot-full-secondary.svg"
                        alt="PingSpot Logo"
                        width={Number(size)}
                        height={Number(size)}
                        className={`w-[${size}px]`}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default PingspotLogo
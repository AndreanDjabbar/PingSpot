import React from 'react'
import Image from 'next/image'

const PingspotLogo = ({
    type = 'full',
    size = '150'
}) => {
    return (
        <>
            {type === 'full' 
            ? (
                <Image
                src="/images/pingspot-logo.svg"
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
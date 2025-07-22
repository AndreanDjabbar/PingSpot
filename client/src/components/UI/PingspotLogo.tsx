import React from 'react'
import Image from 'next/image'

const PingspotLogo = ({
    size = '150'
}) => {
    return (
        <Image
        src="/images/pingspot-logo.svg"
        alt="PingSpot Logo"
        width={Number(size)}
        height={Number(size)}
        className={`w-[${size}px]`}
        />
    )
}

export default PingspotLogo
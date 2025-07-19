import Image from 'next/image'
import React from 'react'

interface BackgroundImageProps {
    className?: string;
    bgName: string;
    imgType: 'jpg' | 'png';
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
    className,
    bgName,
    imgType
}) => {
    return (
        <Image
            src={`/images/${bgName}.${imgType}`}
            alt="Background Image"
            layout="fill"
            objectFit="cover"
            className={className}
        />
    )
}

export default BackgroundImage
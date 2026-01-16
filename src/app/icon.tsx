import { ImageResponse } from 'next/og'
import { FaMapMarkerAlt } from 'react-icons/fa'

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
        <div
            style={{
            fontSize: 24,
            padding: 4,
            borderRadius: '50%',
            display: 'flex',
            fontWeight: 'bold',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            }}
        >
            <FaMapMarkerAlt size={25}/>
        </div>
        ),
        {
        ...size,
        }
    )
}
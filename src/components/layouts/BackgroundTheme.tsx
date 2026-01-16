import React from 'react'

interface BackgroundThemeProps {
    className?: string;
}

const BackgroundTheme: React.FC<BackgroundThemeProps> = ({ 
    className 
}) => (
    <div className={`${className} w-full h-full bg-pingspot flex items-center justify-start fixed right-0 left-1/2`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="text-white text-center w-1/2 p-5">
            <h2 className="text-4xl font-bold mb-4">PingSpot</h2>
            <p className="text-xl">Platform komunitas real-time untuk melaporkan dan memantau permasalahan lokal pada peta interaktif.</p>
            <div className='mt-5'>
                <div className="w-full h-px bg-white/10 my-2"></div>
                <p className="text-white/70 text-xs">&copy; 2025 PingSpot. Hak cipta dilindungi.</p>
            </div>
        </div>
    </div>
);

export default BackgroundTheme
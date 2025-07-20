import React from 'react'

interface BackgroundThemeProps {
    className?: string;
}

const BackgroundTheme: React.FC<BackgroundThemeProps> = ({ 
    className 
}) => (
    <div className={`${className} w-full h-full bg-pingspot-gradient flex items-center justify-center`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-70 text-white text-center p-8">
            <h2 className="text-4xl font-bold mb-4">PingSpot</h2>
            <p className="text-xl opacity-90">Platform komunitas real-time untuk melaporkan dan memantau permasalahan lokal pada peta interaktif.</p>
            <div className='mt-5'>
                <div className="w-full h-px bg-white/10 my-2"></div>
                <p className="text-white/70 text-xs">&copy; 2025 PingSpot. Hak cipta dilindungi.</p>
            </div>
        </div>
    </div>
);

export default BackgroundTheme
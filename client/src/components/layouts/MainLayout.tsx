"use client";
import React, { useState } from 'react'
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import Footer from './Footer';

interface MainLayoutProps {
    children: React.ReactNode;
    sidebarCollapsed?: boolean;
}

interface MainContentProps {
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    sidebarCollapsed = false, 
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bottomNavHeightPosition, setBottomNavHeightPosition] = useState(0);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleBottomNavHeightChange = (position: number) => {
        setBottomNavHeightPosition(position);
    };

    return (
        <div className="h-screen flex flex-col">
            <TopNavigation onMenuToggle={toggleSidebar} />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    isOpen={sidebarOpen} 
                    onToggle={toggleSidebar} 
                    collapsed={sidebarCollapsed}
                    onBottomNavHeightChange={handleBottomNavHeightChange}
                />

                <div className={`flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100`}>
                    <MainContent>{children}</MainContent>
                    <Footer bottomNavHeightPosition={bottomNavHeightPosition} />
                </div>

                <div>
                </div>
            </div>
        </div>
    )
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    return (
        <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-sky-50/30 to-indigo-50/30">
            <div className="h-full p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default MainLayout
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
"use client";

import React, { useEffect, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { SiGmail } from "react-icons/si";
import { PingspotLogo } from '../UI';
import { cn } from '@/lib/utils';

interface FooterProps {
    bottomNavHeightPosition?: number;
}

const Footer: React.FC<FooterProps> = ({ bottomNavHeightPosition = 0 }) => {
    const currentYear = new Date().getFullYear();
    const footerRef = React.useRef<HTMLDivElement>(null);
    const [logoSize, setLogoSize] = useState("200");

    useEffect(() => {
        const updateLogoSize = () => {
            if (window.innerWidth < 640) {
                setLogoSize("150");
            } else if (window.innerWidth < 1024) {
                setLogoSize("180");
            } else {
                setLogoSize("200");
            }
        };

        updateLogoSize();
        window.addEventListener('resize', updateLogoSize);
        return () => window.removeEventListener('resize', updateLogoSize);
    }, []);

    return (
        <footer 
        className={cn("bg-pingspot relative border-l border-white xl:h-(--dynamic-height) h-auto")}
        style={{ ['--dynamic-height' as any]: `${bottomNavHeightPosition}px` } as React.CSSProperties}
        ref={footerRef}
        >
            <div className="px-4 flex flex-col justify-center items">
                <div className='flex flex-col py-4 px-8'>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 sm:gap-8 lg:gap-12">
                        <div className='flex gap-10 justify-between w-full items-center py-3'>
                            <div className="flex flex-col items-center lg:items-start ">
                                <div className="mb-3 sm:mb-4 scale-90 sm:scale-100 origin-center lg:origin-left pl-10 lg:ml-24">
                                    <PingspotLogo size={logoSize} type="secondary" />
                                </div>
                                <p className="text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed text-center px-2 sm:px-4 lg:px-0 lg:pl-2 max-w-md">
                                    Platform pelaporan masalah infrastruktur berbasis komunitas untuk membangun lingkungan yang lebih baik bersama-sama.
                                </p>
                            </div>

                            <div className="flex flex-col items-center lg:items-start">
                                <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl">
                                    Hubungi Developer
                                </h3>
                                <div className="space-y-2 sm:space-y-3 w-full max-w-sm">
                                    <a 
                                        href="mailto:andreanjabar18@gmail.com"
                                        className="flex items-center gap-2 rounded-lg text-white hover:bg-gray-700/50 transition-all duration-200 group p-2"
                                    >
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-pingspot-hoverable rounded-lg flex items-center justify-center shadow-lg">
                                            <SiGmail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400">Email</p>
                                            <p className="text-xs sm:text-sm lg:text-base font-medium truncate">
                                                andreanjabar18@gmail.com
                                            </p>
                                        </div>
                                    </a>
                                    <a 
                                        href="https://github.com/AndreanDjabbar"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg text-white hover:bg-gray-700/50 transition-all duration-200 group p-2"
                                    >
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-pingspot-hoverable rounded-lg flex items-center justify-center shadow-lg">
                                            <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400">GitHub</p>
                                            <p className="text-xs sm:text-sm lg:text-base font-medium">
                                                @AndreanDjabbar
                                            </p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-full border-t border-white/30 my-2"></div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-300 text-xs sm:text-sm lg:text-base text-center">
                            <span>© {currentYear} PingSpot.</span>
                            <span className="hidden sm:inline">Made by</span>
                            <a
                                href="https://github.com/AndreanDjabbar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-white hover:text-sky-400 transition-colors duration-200"
                            >
                                Andrean Gusman Djabbar
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
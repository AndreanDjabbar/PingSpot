/* eslint-disable react-hooks/refs */
"use client";

import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { SiGmail } from "react-icons/si";
import { PingspotLogo } from '../UI';

interface FooterProps {
    bottomNavHeightPosition?: number;
}

const Footer: React.FC<FooterProps> = ({ bottomNavHeightPosition = 0 }) => {
    const currentYear = new Date().getFullYear();
    const footerRef = React.useRef<HTMLDivElement>(null);
    return (
        <footer 
        className="bg-pingspot relative border-l border-white"
        style={{ height: `${bottomNavHeightPosition}px` }}
        ref={footerRef}
        >
            <div className="px-7">
                <div className='flex flex-col gap-5'>
                    <div className="flex justify-between items-center p-5">
                        <div className="flex flex-col w-1/3 items-start">
                            <PingspotLogo size="200" type="secondary" />
                            <p className="text-gray-300 text-sm leading-relaxed pl-8">
                                Platform pelaporan masalah infrastruktur berbasis komunitas untuk membangun lingkungan yang lebih baik bersama-sama.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-2">
                            <h3 className="text-white font-bold text-lg">Hubungi Developer</h3>
                            <div className="space-y-3">
                                <a 
                                    href="mailto:andreanjabar18@gmail.com"
                                    className="flex items-center gap-3 rounded-lg text-white hover:bg-gray-700/50 transition-all duration-200 group p-1"
                                >
                                    <div className="w-10 h-10 bg-pingspot-hoverable rounded-lg flex items-center justify-center transition-transform shadow-lg">
                                        <SiGmail className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-300">Email</p>
                                        <p className="text-sm font-medium">andreanjabar18@gmail.com</p>
                                    </div>
                                </a>
                                <a 
                                    href="https://github.com/AndreanDjabbar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-lg text-white hover:bg-gray-700/50 p-1 transition-all duration-200 group"
                                >
                                    <div className="w-10 h-10 bg-pingspot-hoverable rounded-lg flex items-center justify-center shadow-lg">
                                        <FaGithub className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-300">GitHub</p>
                                        <p className="text-sm font-medium">@AndreanDjabbar</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/50 mb-3"></div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <span>© {currentYear} PingSpot. Made by</span>
                            <a 
                                href="https://github.com/AndreanDjabbar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-white hover:text-sky-400 transition-colors"
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
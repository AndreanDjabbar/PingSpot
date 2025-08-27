/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import MainLayout from '@/layouts/MainLayout'
import React from 'react'
import { BiPlus } from 'react-icons/bi'
import { FaMap, FaUsers } from 'react-icons/fa'
import { GoAlert } from 'react-icons/go'
import { LuActivity } from 'react-icons/lu'
import Map from '../components/Map';

const SettingsPage = () => {
    return (
        <MainLayout>
            <div className="space-y-8">
                Settings page
            </div>
        </MainLayout>
    )
}

export default SettingsPage
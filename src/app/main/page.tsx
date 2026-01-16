/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React from 'react'
import { useUserProfileStore } from '@/stores';

const page = () => {
  const user = useUserProfileStore((state) => state.userProfile);
  return (
    <div>WELCOME TO MAINNNNNNNN {user?.fullName}</div>
  )
}

export default page
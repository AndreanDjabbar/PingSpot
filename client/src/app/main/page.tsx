/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React from 'react'
import { useUserStore } from '@/stores/userStore'

const page = () => {
  const user = useUserStore((state) => state.user);
  return (
    <div>WELCOME TO MAINNNNNNNN {user?.fullName}</div>
  )
}

export default page
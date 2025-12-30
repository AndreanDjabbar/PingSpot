"use client";

import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import Image from 'next/image';

const ProfilePageByUsername = () => {
  const params = useParams();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  
  const userProfile = {
    fullName: `Username fullname for real`,
    username: "Username Only",
    title: "Interface and Brand Designer",
    location: "San Antonio",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    isPro: false,
    followers: 2985,
    following: 132,
    likes: 548,
  };


  return (
    <div className=''>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden relative pb-50">
          <div className="h-24 sm:h-32 md:h-33 lg:h-48 bg-pingspot relative">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-300/30 to-transparent"></div>
          </div>

          <div className=''>
            <div className=''>
              <div className="absolute top-14 left-4 md:left-10 flex flex-col md:flex-row items-center ">
                <div className='flex items-center gap-25 sm:gap-35'>
                  <div>
                    <div className='gap-20'>
                      <div className="rounded-2xl sm:rounded-3xl overflow-hidden ring-4 sm:ring-6 md:ring-8 ring-white shadow-2xl w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-58 lg:h-58 bg-gray-200">
                        <Image
                          src={userProfile.profilePicture}
                          alt={userProfile.fullName || "Profile picture"}
                          className="object-cover w-full h-full"
                          width={232}
                          height={232}
                          priority
                        /> 
                      </div>
                    </div>
                    <div className='md:hidden block'>
                      <div className='flex flex-col items-start mt-2 '>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 max-w-50 break-words">
                            {userProfile.username}
                          </h1>
                          {userProfile.isPro && (
                            <span className="bg-blue-500 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                              PRO ✦
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base md:text-md mb-1 max-w-50 break-words">
                          {userProfile.fullName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col items-center sm:pt-20 pt-10 md:hidden'>
                    <div className="gap-4 sm:gap-6 md:gap-8 md:hidden">
                      <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                        <div className="text-center">
                          <div className="text-gray-600 text-xs sm:text-sm md:text-md mb-1">Followers</div>
                          <div className="text-sm sm:text-base md:text-md font-bold text-gray-900">
                            {userProfile.followers.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs sm:text-sm md:text-md mb-1">Following</div>
                          <div className="text-sm sm:text-base md:text-md font-bold text-gray-900">
                            {userProfile.following}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs sm:text-sm md:text-md mb-1">Likes</div>
                          <div className="text-sm sm:text-base md:text-md font-bold text-gray-900">
                            {userProfile.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 mt-2 text-xs sm:text-sm md:text-base md:flex">
                      <button className="bg-gray-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Follow
                      </button>
                      <button className="bg-white text-gray-900 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-medium border-2 border-gray-900 hover:bg-gray-50 transition-colors">
                        Chat
                      </button>
                    </div>
                  </div>
                </div>

                <div className='md:pt-20 lg:pt-35 ml-3 flex items-center justify-between w-full md:gap-15 lg:gap-25 xl:gap-40'>
                  <div className='hidden md:block '>
                    <div className='flex flex-col items-start mt-2 '>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 max-w-50 break-words">
                          {userProfile.username}
                        </h1>
                        {userProfile.isPro && (
                          <span className="bg-blue-500 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                            PRO ✦
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base md:text-md mb-1 max-w-50 break-words">
                        {userProfile.fullName}
                      </p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 mt-2 text-xs sm:text-sm md:text-base md:flex">
                      <button className="bg-gray-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Follow
                      </button>
                      <button className="bg-white text-gray-900 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-medium border-2 border-gray-900 hover:bg-gray-50 transition-colors">
                        Chat
                      </button>
                    </div>
                  </div>
                  <div className="gap-4 sm:gap-6 md:gap-8 hidden md:block">
                    <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                      <div className="text-center">
                        <div className="text-gray-600 text-xs sm:text-sm md:text-md lg:text-xl mb-1">Followers</div>
                        <div className="text-sm sm:text-base md:text-md lg:text-xl  font-bold text-gray-900">
                          {userProfile.followers.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600 text-xs sm:text-sm md:text-md lg:text-xl  mb-1">Following</div>
                        <div className="text-sm sm:text-base md:text-md font-bold lg:text-xl text-gray-900">
                          {userProfile.following}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600 text-xs sm:text-sm md:text-md lg:text-xl mb-1">Likes</div>
                        <div className="text-sm sm:text-base md:text-md font-bold lg:text-xl text-gray-900">
                          {userProfile.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageByUsername;
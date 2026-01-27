"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Image from 'next/image';
import { useGetProfileByUsername, useErrorToast } from '@/hooks';
import { ErrorSection } from '@/components';
import { getErrorResponseMessage, getImageURL, isInternalServerError, isNotFoundError } from '@/utils';

const ProfilePageByUsername = () => {
  const params = useParams();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const router = useRouter();

  const { 
    isPending: isFetchingUser, 
    isError: isErrorFetchingUser, 
    error: errorFetchingUser, 
    refetch: refetchUser, 
    data: userData 
  } = useGetProfileByUsername(username || '');
  
  const userProfile = {
    fullName: userData?.data?.fullName || "User's full name",
    username: userData?.data?.username || username || "username",
    title: "Interface and Brand Designer",
    location: "San Antonio",
    profilePicture: getImageURL(userData?.data?.profilePicture || '', "user") || "/default-profile.png",
    isPro: false,
    followers: 2985,
    following: 132,
    likes: 548,
  };

  useErrorToast(isErrorFetchingUser, errorFetchingUser?.message || "Gagal memuat profil pengguna.");

  if (isErrorFetchingUser) {
    const isNotFound = isNotFoundError(errorFetchingUser);
    const isServerError = isInternalServerError(errorFetchingUser);

    return (
      <div className=''>
        <ErrorSection 
        errors={getErrorResponseMessage(errorFetchingUser)}
        message={getErrorResponseMessage(errorFetchingUser)}
        onGoBack={() => router.back()}
        onGoHome={() => router.push("/main/home")}
        onRetry={() => refetchUser()}
        showBackButton={isNotFound}
        showHomeButton={isNotFound}
        showRetryButton={isServerError}
        />
      </div>
    )
  }

  if (isFetchingUser) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden relative pb-50 animate-pulse">
          <div className="h-24 sm:h-32 md:h-33 lg:h-48 bg-gray-200"></div>
          
          <div className="px-4 md:px-10">
            <div className="flex items-center justify-between md:justify-center md:gap-30 lg:gap-70">
              <div className='flex flex-col md:flex-row items-start md:items-center gap-4 -mt-12 md:-mt-20'>
                <div className="rounded-2xl sm:rounded-3xl w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-58 lg:h-58 bg-gray-300 ring-4 sm:ring-6 md:ring-8 ring-white"></div>
                <div className='flex items-center gap-6'>
                  <div className="flex-1 space-y-3 w-full md:pt-25">
                    <div className="h-8 bg-gray-300 rounded w-28"></div>
                    <div className="h-5 bg-gray-300 rounded w-32"></div>
                    
                    <div className="flex gap-2 hidden md:flex">
                      <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
                      <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className='flex flex-col items-center gap-4'>
                  <div className="flex gap-6 md:pt-20 md:hidden">
                    <div className="text-center space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                      <div className="h-6 bg-gray-300 rounded w-12"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                      <div className="h-6 bg-gray-300 rounded w-12"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                      <div className="h-6 bg-gray-300 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="flex gap-2 md:hidden">
                    <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
                    <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
                  </div>
                </div>
                
                <div className="flex gap-6 md:pt-20 hidden md:flex">
                  <div className="text-center space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-12"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-12"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      <div className="rounded-2xl sm:rounded-3xl overflow-hidden ring-4 sm:ring-6 md:ring-8 ring-white shadow-2xl w-24 h-24 sm:w-30 sm:h-30 md:w-40 md:h-40 lg:w-58 lg:h-58 bg-gray-200">
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
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import "./globals.css";
import { ReactQueryClientProvider } from "@/provider/react-query-client";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useGlobalStore } from "@/stores/globalStore";
import { useLocationStore } from "@/stores/userLocationStore";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const loadUser = useUserProfileStore((state) => state.loadUser);
  const globalStore = useGlobalStore();
  const locationStore = useLocationStore();

  useEffect(() => {
    const now = Date.now();
    if (globalStore.expiredAt && now > globalStore.expiredAt) {
      globalStore.clearGlobalData();
    }

    if (locationStore.location?.expiresAt && now > locationStore.location.expiresAt) {
      locationStore.clearLocation();
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "var(--font-sf)" }}>
        <ReactQueryClientProvider>
          <ToastContainer />
          {children}
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;
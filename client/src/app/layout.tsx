"use client";

import "./globals.css";
import { ReactQueryClientProvider } from "@/provider/react-query-client";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { useUserProfileStore } from "@/stores/userProfileStore";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const loadUser = useUserProfileStore((state) => state.loadUser);

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
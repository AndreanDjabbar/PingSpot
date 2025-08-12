import "./globals.css";
import { ReactQueryClientProvider } from "@/provider/react-query-client";
import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "PingSpot",
  description: "Real-time community-powered issue tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased`}
      style={{ fontFamily: 'var(--font-sf)' }}>
        <ReactQueryClientProvider>
          <ToastContainer/>
          {children}
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

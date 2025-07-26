import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactQueryClientProvider } from "@/provider/react-query-client";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReactQueryClientProvider>
          {children}
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

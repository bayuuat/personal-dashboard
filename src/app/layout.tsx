import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/top-header";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description: "Modern dashboard for Job Sniper and Mana Uang data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col pt-14 md:pt-0 md:pl-64">
            <TopHeader />
            <main className="flex-1 p-4 pt-4 md:p-6 md:pt-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

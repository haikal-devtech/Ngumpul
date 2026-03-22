import React from "react";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import AppLayout from "@/components/AppLayout";

export const metadata = {
  title: "Ngumpul - Smart Scheduling",
  description: "Aplikasi Penjadwalan Ketemuan Bareng yang Cerdas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
        <AppProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import { ChatToggle } from "@/components/chat-toggle";

export const metadata: Metadata = {
  title: "RoomMatch PK - Find Your Perfect Hostel",
  description: "Find and book the perfect hostel accommodation in Pakistan. Connect students with verified hostel owners.",
  icons: {
    icon: [
      '/LOGOs.jpg',
      {
        url: '/LOGOs.jpg',
        sizes: '48x48',
        type: 'image/jpeg',
      },
    ],
    apple: [
      {
        url: '/LOGOs.jpg',
        sizes: '180x180',
        type: 'image/jpeg',
      },
    ],
    shortcut: '/LOGOs.jpg',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased scroll-smooth" suppressHydrationWarning>
        <ClientProviders>
          {children}
          <ChatToggle />
        </ClientProviders>
      </body>
    </html>
  );
}

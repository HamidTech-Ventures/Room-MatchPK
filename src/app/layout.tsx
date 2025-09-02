import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import { ChatToggle } from "@/components/chat-toggle";

export const metadata: Metadata = {
  title: "RoomMatch PK - Find Your Perfect Hostel",
  description: "Find and book the perfect hostel accommodation in Pakistan. Connect students with verified hostel owners.",
  icons: {
    icon: [
      '/favicon.ico',
      {
        url: '/RoomMatch Pk Logo.svg',
        sizes: '48x48',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/RoomMatch Pk Logo.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/RoomMatch Pk Logo.svg',
  },
  manifest: '/site.webmanifest',
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/RoomMatch Pk Logo.svg" type="image/svg+xml" sizes="48x48" />
        <link rel="apple-touch-icon" href="/RoomMatch Pk Logo.svg" type="image/svg+xml" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className="antialiased scroll-smooth" suppressHydrationWarning>
        <ClientProviders>
          {children}
          <ChatToggle />
        </ClientProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import { ChatToggle } from "@/components/chat-toggle";

export const metadata: Metadata = {
  title: "RoomMatch PK - Find Your Perfect Hostel",
  description: "Find and book the perfect hostel accommodation in Pakistan. Connect students with verified hostel owners.",
  icons: {
    icon: [
      {
        url: '/logo.jpg',
        sizes: '32x32',
        type: 'image/jpeg',
      },
      {
        url: '/logo.jpg',
        sizes: '16x16',
        type: 'image/jpeg',
      },
    ],
    apple: [
      {
        url: '/logo.jpg',
        sizes: '180x180',
        type: 'image/jpeg',
      },
    ],
    shortcut: '/logo.jpg',
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
        <link rel="icon" href="/logo.jpg" type="image/jpeg" sizes="32x32" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" sizes="16x16" />
        <link rel="apple-touch-icon" href="/logo.jpg" type="image/jpeg" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ClientProviders>
          {children}
          <ChatToggle />
        </ClientProviders>
      </body>
    </html>
  );
}

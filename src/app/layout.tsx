import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import { ChatToggle } from "@/components/chat-toggle";

export const metadata: Metadata = {
  title: "RoomMatch PK - Find Your Perfect Hostel",
  description:
    "Find and book the perfect hostel accommodation in Pakistan. Connect students with verified hostel owners."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
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

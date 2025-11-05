"use client"

import { AuthProvider } from "@/contexts/auth-context";
import { ChatProvider } from "@/contexts/chat-context";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { DatabaseInitializer } from "@/components/database-initializer";
import { ConfigurationChecker } from "@/components/configuration-checker";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <ConfigurationChecker />
      <DatabaseInitializer />
      <AuthProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </AuthProvider>
      <Toaster />
      <SonnerToaster />
    </SessionProvider>
  );
}
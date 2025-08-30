import type { Viewport } from "next";

// Global viewport configuration for the entire app
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Add other viewport configurations as needed
  viewportFit: 'cover',
};

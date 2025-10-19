"use client";

import { GeistMono } from "geist/font/mono";
import { Roboto_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from 'next-auth/react';
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import ColorStyles from "@/components/shared/color-styles/color-styles";
import Scrollbar from "@/components/ui/scrollbar";
import { BigIntProvider } from "@/components/providers/BigIntProvider";
import "styles/main.css";

// Make Convex optional (using PostgreSQL by default)
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
});

// Metadata must be in a separate server component
// For now, set via document head

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        <html lang="en">
          <head>
            <title>Open Agent Builder</title>
            <meta name="description" content="Build AI agents and workflows with visual programming" />
            <link rel="icon" href="/favicon.png" />
            <ColorStyles />
          </head>
          <body
            className={`${GeistMono.variable} ${robotoMono.variable} font-sans text-accent-black bg-background-base overflow-x-clip`}
          >
            <BigIntProvider>
              <main className="overflow-x-clip">{children}</main>
              <Scrollbar />
              <Toaster position="bottom-right" />
            </BigIntProvider>
          </body>
        </html>
      </ConvexProvider>
    </SessionProvider>
  );
}


"use client";

import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import HeaderBrandKit from "@/components/shared/header/BrandKit/BrandKit";
import HeaderWrapper from "@/components/shared/header/Wrapper/Wrapper";
import HeaderDropdownWrapper from "@/components/shared/header/Dropdown/Wrapper/Wrapper";
import ButtonUI from "@/components/ui/shadcn/button";
import GithubIcon from "@/components/shared/header/Github/_svg/GithubIcon";
import { Connector } from "@/components/shared/layout/curvy-rect";
import UIBuilderCanvas from "@/components/ui-builder/UIBuilderCanvas";
import { HeaderProvider } from "@/components/shared/header/HeaderContext";

export default function UIBuilderPage() {
  const router = useRouter();

  return (
    <HeaderProvider>
      <div className="min-h-screen bg-background-base">
        {/* Header/Navigation Section */}
        <HeaderDropdownWrapper />

      <div className="sticky top-0 left-0 w-full z-[101] bg-background-base header">
        <div className="absolute top-0 cmw-container border-x border-border-faint h-full pointer-events-none" />

        <div className="h-1 bg-border-faint w-full left-0 -bottom-1 absolute" />

        <div className="cmw-container absolute h-full pointer-events-none top-0">
          <Connector className="absolute -left-[10.5px] -bottom-11" />
          <Connector className="absolute -right-[10.5px] -bottom-11" />
        </div>

        <HeaderWrapper>
          <div className="max-w-[900px] mx-auto w-full flex justify-between items-center">
            <div className="flex gap-24 items-center">
              <HeaderBrandKit />
            </div>

            <div className="flex gap-8 items-center">
              {/* Back to Home */}
              <ButtonUI variant="outline" onClick={() => router.push('/')}>
                Back to Home
              </ButtonUI>

              {/* GitHub Template Button */}
              <a
                className="contents"
                href="https://github.com/firecrawl/firecrawl"
                target="_blank"
              >
                <ButtonUI variant="secondary">
                  <GithubIcon />
                  Use this Template
                </ButtonUI>
              </a>

              {/* Clerk Auth */}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-16 py-8 bg-heat-100 hover:bg-heat-200 text-white rounded-8 text-body-medium font-medium transition-all active:scale-[0.98]">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-32 h-32",
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </SignedIn>
            </div>
          </div>
        </HeaderWrapper>
      </div>

      {/* Main UI Builder Content */}
      <SignedIn>
        <UIBuilderCanvas />
      </SignedIn>

      <SignedOut>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to use the UI Builder</h2>
            <SignInButton mode="modal">
              <button className="px-24 py-12 bg-heat-100 hover:bg-heat-200 text-white rounded-8 text-body-medium font-medium transition-all active:scale-[0.98]">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      </div>
    </HeaderProvider>
  );
}

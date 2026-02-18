"use client";
import { Suspense } from "react";
import TriConnectApp from "@/components/app/triconnect/TriConnectApp";

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "hsl(220 15% 8%)", color: "hsl(0 0% 95%)" }}>Loading...</div>}>
      <TriConnectApp />
    </Suspense>
  );
}

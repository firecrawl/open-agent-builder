"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkflowsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home with workflows view
    router.push('/?view=workflows');
  }, [router]);

  return null;
}

"use client";

import dynamic from "next/dynamic";

const OngoingTestClient = dynamic(() => import("./OngoingTestClient"), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Loading Test...</div>,
});

export default function OngoingTestPage() {
  return <OngoingTestClient />;
}

"use client";

import { useConvexAuth } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ReactNode } from "react";

export function AuthWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Redirect to /auth if not logged in and trying to access protected route
    if (!isAuthenticated && pathname !== "/auth") {
      router.push("/auth");
    }

    // Redirect to / (home) if logged in and trying to access /auth
    if (isAuthenticated && pathname === "/auth") {
        router.push("/");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#101622] gap-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Loading...</p>
        </div>
      );
  }

  // Prevent flash of protected content
  if (!isAuthenticated && pathname !== "/auth") {
      return null;
  }

  return <>{children}</>;
}

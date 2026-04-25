"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const user = authApi.getStoredUser();

      if (token && token.length > 0 && token !== "undefined" && token !== "null" && user) {
        router.replace("/inbox");
      } else {
        router.replace("/login");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  return null;
}
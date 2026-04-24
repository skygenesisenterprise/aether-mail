"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { authApi } from "@/lib/api/auth";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function MfaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const email = searchParams.get("email") || "";
  const method = searchParams.get("method") || "totp";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code || code.length < 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/totp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, totpCode: code }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "The entered code is invalid or has expired.");
        setIsLoading(false);
        return;
      }

      if (data.accessToken) {
        authApi.storeTokens(data.accessToken, data.refreshToken || "");
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-primary">Sky Genesis Enterprise</h1>
              <h2 className="mt-4 text-2xl font-bold text-foreground">Two-Factor Authentication</h2>
              <p className="mt-2 text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => setCode(value)}
                    className="gap-2"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12 text-center text-lg" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-center text-lg" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-center text-lg" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="w-12 h-12 text-center text-lg" />
                      <InputOTPSlot index={4} className="w-12 h-12 text-center text-lg" />
                      <InputOTPSlot index={5} className="w-12 h-12 text-center text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-center text-sm text-muted-foreground">6-digit code</p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold tracking-wide"
                disabled={isLoading || code.length < 6}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Secure SSL/TLS Connection</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="p-6 bg-muted/50 border-t border-border">
        <div className="max-w-md mx-auto text-center text-sm text-muted-foreground space-y-2">
          <p>
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
          <p className="text-xs">
            Any unauthorized access attempt is strictly prohibited and will be reported to the
            proper authorities.
          </p>
        </div>
      </footer>
    </div>
  );
}
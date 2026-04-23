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
import { Shield, Lock, AlertCircle, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sky Genesis Enterprise</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-balance">
                Two-Step Verification
              </h2>
              <p className="mt-4 text-primary-foreground/80 leading-relaxed">
                To protect your account, please enter the verification code sent to your trusted
                device.
              </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-primary-foreground/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Enhanced Security</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Two-factor authentication ensures the integrity of your access
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Temporary Code</h3>
                  <p className="text-sm text-primary-foreground/70">
                    The code expires after 30 seconds for maximum security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-primary-foreground/60">
          <p>&copy; 2026 Sky Genesis Enterprise. All rights reserved.</p>
          <p className="mt-1">Version 1.0.0 | Last updated: April 2026</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="lg:hidden bg-primary text-primary-foreground p-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold">Sky Genesis Enterprise</h1>
              <p className="text-primary-foreground/70 text-sm">Institutional Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h2>
              <p className="mt-2 text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to sign in</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Secure Access</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have access to your device?
                <a href="#" className="text-primary font-medium hover:underline ml-1">
                  Use a recovery code
                </a>
              </p>
            </form>
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
    </div>
  );
}

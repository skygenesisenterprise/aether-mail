"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Globe, AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthorizePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState("");

  const clientId = searchParams.get("client_id") || "";
  const redirectUri = searchParams.get("redirect_uri") || "";
  const responseType = searchParams.get("response_type") || "code";
  const scope = searchParams.get("scope") || "openid profile email";
  const state = searchParams.get("state") || "";

  const scopesArray = scope.split(" ");

  useEffect(() => {
    if (!clientId || !redirectUri) {
      setError("Invalid authorization request parameters");
    }
  }, [clientId, redirectUri]);

  const handleAuthorize = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          redirectUri,
          responseType,
          scope,
          state,
          approved: true,
          rememberDevice,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Authorization failed");
        setIsLoading(false);
        return;
      }

      if (data.redirectUri) {
        window.location.href = data.redirectUri;
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Error during authorization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    setIsLoading(true);

    const errorUrl = new URL(redirectUri);
    errorUrl.searchParams.set("error", "access_denied");
    errorUrl.searchParams.set("error_description", "The user denied the authorization request");
    if (state) errorUrl.searchParams.set("state", state);

    window.location.href = errorUrl.toString();
  };

  const formatScope = (s: string) => {
    const scopeLabels: Record<string, string> = {
      "read:profile": "Read profile",
      "write:profile": "Modify profile",
      "read:email": "Read email address",
      openid: "OpenID Authentication",
      profile: "Profile information",
      email: "Email address",
    };
    return scopeLabels[s] || s;
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
                Application Authorization
              </h2>
              <p className="mt-4 text-primary-foreground/80 leading-relaxed">
                Grant or deny access to your account for third-party applications in a secure and
                controlled manner.
              </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-primary-foreground/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Full Control</h3>
                  <p className="text-sm text-primary-foreground/70">
                    You maintain control over applications accessing your data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Revocable Access</h3>
                  <p className="text-sm text-primary-foreground/70">
                    You can revoke access at any time from your settings
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Transparency</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Requested permissions are always clearly displayed
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
              <h2 className="text-2xl font-bold text-foreground">Authorization Request</h2>
              <p className="mt-2 text-muted-foreground">
                A third-party application is requesting access to your account
              </p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Globe className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">External Application</h3>
                    <p className="text-sm text-muted-foreground">{redirectUri}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">
                    This application is requesting the following permissions:
                  </p>
                  <ul className="space-y-2">
                    {scopesArray.map((s: string) => (
                      <li key={s} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked
                          disabled
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-muted-foreground">{formatScope(s)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberDevice}
                  onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Remember this device for future authorizations
                </Label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeny}
                  disabled={isLoading}
                  className="flex-1 h-11 border-border hover:bg-muted"
                >
                  Deny
                </Button>
                <Button
                  type="button"
                  onClick={handleAuthorize}
                  disabled={isLoading}
                  className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold tracking-wide"
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
                      Processing...
                    </span>
                  ) : (
                    "Authorize"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to my account</span>
                </button>
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
    </div>
  );
}

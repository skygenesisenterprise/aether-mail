import { RegisterForm } from "@/components/auth/register-form";
import { Shield, Lock, Clock, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12 overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sky Genesis Enterprise</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-balance">
                Join the Official Portal
              </h2>
              <p className="mt-4 text-primary-foreground/80 leading-relaxed">
                Create your account to access all enterprise services. Your registration will be
                verified by our security team.
              </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-primary-foreground/20">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Advanced Protection</h3>
                  <p className="text-sm text-primary-foreground/70">
                    End-to-end encryption compliant with government standards
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Regulatory Compliance</h3>
                  <p className="text-sm text-primary-foreground/70">
                    ISO 27001 certified and GDPR compliant
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">24/7 Availability</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Redundant infrastructure and continuous technical support
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

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-primary text-primary-foreground p-4 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold">Sky Genesis Enterprise</h1>
              <p className="text-primary-foreground/70 text-xs">Institutional Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 bg-background overflow-y-auto">
          <div className="w-full max-w-md space-y-4">
            <div className="text-center lg:text-left">
              <h2 className="text-lg lg:text-xl font-bold text-foreground">Create Account</h2>
              <p className="mt-1 text-xs lg:text-sm text-muted-foreground">
                Sign up to access your secure space
              </p>
            </div>

            <RegisterForm />

            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Secure SSL/TLS Connection</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-4 bg-muted/50 border-t border-border shrink-0">
          <div className="max-w-md mx-auto text-center text-xs lg:text-sm text-muted-foreground space-y-1">
            <p>
              By registering, you agree to our{" "}
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

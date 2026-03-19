"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const passwordRequirements = [
    {
      label: "15 characters, or 8 characters including a number and a lowercase letter",
      met:
        password.length >= 15 ||
        (password.length >= 8 && /[0-9]/.test(password) && /[a-z]/.test(password)),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(email, username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-md border border-border bg-card p-4">
      <div className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {/* Username */}
        <div className="flex flex-col gap-2">
          <label htmlFor="user_login" className="text-sm font-medium text-foreground">
            Username
          </label>
          <input
            id="user_login"
            name="user[login]"
            type="text"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="user_email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="user_email"
            name="user[email]"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="user_password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              id="user_password"
              name="user[password]"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  {req.met ? (
                    <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                  ) : (
                    <X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-destructive" />
                  )}
                  <span className={`text-xs ${req.met ? "text-primary" : "text-muted-foreground"}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email preferences */}
        <div className="rounded-md border border-border bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {"By creating an account, you agree to the "}
            <a href="#" className="text-[#2f81f7] hover:underline">
              Terms of Service
            </a>
            {". For more information about Giteria's privacy practices, see the "}
            <a href="#" className="text-[#2f81f7] hover:underline">
              Privacy Statement
            </a>
            {". We'll occasionally send you account-related emails."}
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}

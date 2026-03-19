import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { PasskeyOption, CreateAccountLink } from "@/components/passkey-option";
import { OAuthOptions } from "@/components/oauth-options";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-light text-foreground text-balance text-center">
        Sign in to Aether Mail
      </h1>
      <LoginForm />
      <PasskeyOption />
      <CreateAccountLink />
    </>
  );
}

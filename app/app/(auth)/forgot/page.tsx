import type { Metadata } from "next"
import { ForgotForm } from "@/components/forgot-form"

export const metadata: Metadata = {
  title: "Forgot your password?",
}

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-light text-foreground text-balance text-center">
        Reset your password
      </h1>
      <ForgotForm />
    </>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Join Giteria",
}

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-light text-foreground text-balance text-center">
        Create your account
      </h1>
      <RegisterForm />
      <div className="w-full rounded-md border border-border p-4 text-center text-sm">
        <span className="text-foreground">Already have an account? </span>
        <Link href="/login" className="text-[#2f81f7] hover:underline">
          Sign in
        </Link>
        .
      </div>
    </>
  )
}

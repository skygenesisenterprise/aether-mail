"use client"

import { useState } from "react"
import Link from "next/link"

export function ForgotForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="w-full rounded-md border border-border bg-card p-4">
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-[#238636]/40 bg-[#238636]/10 px-3 py-2">
            <p className="text-sm text-primary">
              Check your email for a link to reset your password. If it does not appear within a few minutes, check your spam folder.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="w-full rounded-md border border-border bg-card p-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email_field"
            className="text-sm font-medium text-foreground"
          >
            Enter your email address and we will send you a password reset link.
          </label>
          <input
            id="email_field"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
        >
          Send password reset email
        </button>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="px-3 text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <Link
          href="/register"
          className="text-center text-sm text-[#2f81f7] hover:underline"
        >
          Create an account
        </Link>
      </div>
    </form>
  )
}

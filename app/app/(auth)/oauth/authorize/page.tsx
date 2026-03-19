import type { Metadata } from "next"
import { Suspense } from "react"
import { OAuthAuthorizeForm } from "@/components/oauth-authorize-form"

export const metadata: Metadata = {
  title: "Authorize application",
}

export default function OAuthAuthorizePage() {
  return (
    <>
      <h1 className="text-2xl font-light text-foreground text-balance text-center">
        Authorize application
      </h1>
      <Suspense fallback={
        <div className="w-full rounded-md border border-border bg-card p-4 animate-pulse">
          <div className="flex flex-col gap-4">
            <div className="h-16 rounded-md bg-secondary" />
            <div className="h-24 rounded-md bg-secondary" />
            <div className="h-10 rounded-md bg-secondary" />
          </div>
        </div>
      }>
        <OAuthAuthorizeForm />
      </Suspense>
    </>
  )
}

"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ExternalLink, Shield } from "lucide-react"

export function OAuthAuthorizeForm() {
  const searchParams = useSearchParams()
  const clientName = searchParams.get("client_name") || "Third-Party App"
  const scope = searchParams.get("scope") || "read:user,user:email"
  const redirectUri = searchParams.get("redirect_uri") || "https://example.com/callback"

  const scopes = scope.split(",").map((s) => s.trim())

  const scopeDescriptions: Record<string, string> = {
    "read:user": "Read your profile information",
    "user:email": "Access your email addresses",
    "repo": "Full control of private repositories",
    "read:repo": "Read access to repositories",
    "write:repo": "Write access to repositories",
    "read:org": "Read organization membership",
    "admin:org": "Full control of organizations",
    "gist": "Create and manage gists",
    "notifications": "Access notifications",
    "delete_repo": "Delete repositories",
  }

  return (
    <div className="w-full rounded-md border border-border bg-card p-4">
      <div className="flex flex-col gap-4">
        {/* App info */}
        <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{clientName}</span>
            <span className="text-xs text-muted-foreground">wants to access your Giteria account</span>
          </div>
        </div>

        {/* Permissions */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Permissions</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {scopes.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-foreground">
                  {scopeDescriptions[s] || s}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Redirect info */}
        <div className="rounded-md border border-border bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {"Authorizing will redirect to "}
            <span className="font-mono text-foreground">{redirectUri}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
          >
            Authorize {clientName}
          </button>
          <Link
            href="/login"
            className="w-full rounded-md border border-border bg-secondary px-4 py-2 text-center text-sm font-medium text-secondary-foreground hover:bg-[#30363d] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Policy */}
        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          {"Authorizing will allow the third-party app to act on your behalf. See Giteria's "}
          <a href="#" className="text-[#2f81f7] hover:underline">authorization policy</a>
          {" for more."}
        </p>
      </div>
    </div>
  )
}

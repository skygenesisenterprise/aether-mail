import { Fingerprint } from "lucide-react"
import Link from "next/link"

export function PasskeyOption() {
  return (
    <div className="w-full rounded-md border border-border bg-card p-4">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-[#30363d] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
      >
        <Fingerprint className="h-4 w-4" />
        Sign in with a passkey
      </button>
    </div>
  )
}

export function CreateAccountLink() {
  return (
    <div className="w-full rounded-md border border-border p-4 text-center text-sm">
      <span className="text-foreground">New to Giteria? </span>
      <Link href="/register" className="text-[#2f81f7] hover:underline">
        Create an account
      </Link>
      .
    </div>
  )
}

import { Github, Gitlab } from "lucide-react";

export function OAuthOptions() {
  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href="/api/auth/github"
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-[#30363d] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
        <a
          href="/api/auth/gitlab"
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-[#30363d] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
        >
          <Gitlab className="h-4 w-4" />
          GitLab
        </a>
      </div>
    </div>
  );
}

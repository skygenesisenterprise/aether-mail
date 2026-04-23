import { Shield } from "lucide-react"

interface SkyGenesisLogoProps {
  className?: string
  variant?: "light" | "dark"
}

export function SkyGenesisLogo({ className = "", variant = "dark" }: SkyGenesisLogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-foreground"
  const iconBg = variant === "light" ? "bg-white/20" : "bg-primary"
  const iconColor = variant === "light" ? "text-white" : "text-primary-foreground"

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}>
        <Shield className={`h-7 w-7 ${iconColor}`} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col">
        <span className={`text-lg font-bold tracking-tight ${textColor}`}>
          SKY GENESIS
        </span>
        <span className={`text-xs font-medium uppercase tracking-widest ${variant === "light" ? "text-white/70" : "text-muted-foreground"}`}>
          Enterprise
        </span>
      </div>
    </div>
  )
}

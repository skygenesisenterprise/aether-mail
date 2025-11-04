import type React from "react";
import { cn } from "../../lib/utils";

interface GlassBadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const GlassBadge: React.FC<GlassBadgeProps> = ({
  variant = "primary",
  size = "md",
  children,
  className,
  icon,
}) => {
  const baseClasses = "glass-badge inline-flex items-center font-medium";

  const variantClasses = {
    primary: "glass-badge-primary",
    secondary: "glass-badge",
    success: "glass-badge-success",
    warning: "bg-glass-warning text-white",
    error: "bg-glass-error text-white",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default GlassBadge;

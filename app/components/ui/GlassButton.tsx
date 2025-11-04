import type React from "react";
import { cn } from "../../lib/utils";

interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  variant = "secondary",
  size = "md",
  children,
  className,
  ...props
}) => {
  const baseClasses =
    "glass font-medium transition-all duration-300 relative overflow-hidden glass-ripple";

  const variantClasses = {
    primary: "glass-button-primary",
    secondary: "glass-button",
    ghost: "glass-no-border px-4 py-2 rounded-lg",
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlassButton;

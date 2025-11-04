import type React from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "lg" | "xl";
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  variant = "default",
  children,
  className,
  hover = false,
  ...props
}) => {
  const baseClasses = "glass";

  const variantClasses = {
    default: "glass-card",
    lg: "glass-card-lg",
    xl: "glass-card-xl",
  };

  const hoverClasses = hover ? "glass-hover-lift glass-hover-glow" : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;

import type React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  className,
  ...props
}) => {
  const baseClasses = "rounded-xl transition-all duration-200";

  const variants = {
    default: "bg-white dark:bg-gray-800 shadow-sm",
    elevated: "bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl",
    outlined:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

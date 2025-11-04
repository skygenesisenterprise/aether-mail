import type React from "react";
import { cn } from "../../lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  status?: "online" | "offline" | "away" | "busy";
  showStatus?: boolean;
  animated?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback = "?",
  size = "md",
  className,
  status = "offline",
  showStatus = false,
  animated = false,
}) => {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const statusColors = {
    online: "bg-green-500 border-green-600",
    offline: "bg-gray-500 border-gray-600",
    away: "bg-yellow-500 border-yellow-600",
    busy: "bg-red-500 border-red-600",
  };

  const statusSizes = {
    sm: "w-2 h-2 -bottom-0 -right-0",
    md: "w-2.5 h-2.5 -bottom-0.5 -right-0.5",
    lg: "w-3 h-3 -bottom-0.5 -right-0.5",
    xl: "w-4 h-4 -bottom-1 -right-1",
  };

  if (src) {
    return (
      <div className={cn("relative inline-block", className)}>
        <img
          src={src}
          alt={alt}
          className={cn(
            "rounded-full object-cover",
            sizes[size],
            animated && "animate-pulse",
            "transition-transform duration-200 hover:scale-105",
          )}
        />
        {showStatus && (
          <div
            className={cn(
              "absolute rounded-full border-2 border-gray-900",
              statusColors[status],
              statusSizes[size],
              status === "online" && "animate-pulse",
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg",
          sizes[size],
          animated && "animate-pulse",
          "transition-all duration-200 hover:shadow-xl hover:scale-105",
        )}
      >
        {fallback.charAt(0).toUpperCase()}
      </div>
      {showStatus && (
        <div
          className={cn(
            "absolute rounded-full border-2 border-gray-900",
            statusColors[status],
            statusSizes[size],
            status === "online" && "animate-pulse",
          )}
        />
      )}
    </div>
  );
};

export default Avatar;

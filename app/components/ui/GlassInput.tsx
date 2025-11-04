import type React from "react";
import { cn } from "../../lib/utils";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-glass-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-glass-text-muted">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "glass-input w-full",
            icon && "pl-10",
            error && "border-glass-error",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-glass-error">{error}</p>}
    </div>
  );
};

export default GlassInput;

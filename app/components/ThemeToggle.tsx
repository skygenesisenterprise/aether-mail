"use client";

import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case "dark":
        return "🌙";
      case "light":
        return "☀️";
      case "system":
        return resolvedTheme === "dark" ? "🌙" : "☀️";
      default:
        return "🌙";
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "dark":
        return "Mode sombre";
      case "light":
        return "Mode clair";
      case "system":
        return `Système (${resolvedTheme === "dark" ? "sombre" : "clair"})`;
      default:
        return "Mode sombre";
    }
  };

  const handleToggle = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      title={getLabel()}
      aria-label={getLabel()}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}

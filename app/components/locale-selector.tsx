"use client";

import { useLocale } from "@/context/locale-context";
import { locales, Locale } from "@/lib/locale";
import Link from "next/link";

export function LocaleSelector() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex gap-2">
      {locales.map((loc) => (
        <button
          key={loc.code}
          onClick={() => setLocale(loc.code)}
          className={`text-sm px-2 py-1 rounded transition-colors ${
            locale === loc.code
              ? "bg-primary text-primary-foreground"
              : "text-foreground/70 hover:text-foreground"
          }`}
        >
          {loc.flag} {loc.label}
        </button>
      ))}
    </div>
  );
}

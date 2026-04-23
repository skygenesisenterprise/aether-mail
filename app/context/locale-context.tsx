"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, defaultLocale, isValidLocale } from "@/lib/locale";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  pathname: string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [pathname, setPathname] = useState<string>("");

  useEffect(() => {
    const path = window.location.pathname;
    setPathname(path);

    if (!initialLocale) {
      const segments = path.split("/").filter(Boolean);
      const potentialLocale = segments[0];
      if (potentialLocale && isValidLocale(potentialLocale)) {
        setLocaleState(potentialLocale);
      }
    }
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length > 0 && isValidLocale(segments[0])) {
      segments[0] = newLocale;
      window.location.href = "/" + segments.join("/");
    } else {
      window.location.href = "/" + newLocale + pathname;
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, pathname }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "be_fr", "be_nl", "ch_fr", "en", "es", "de"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

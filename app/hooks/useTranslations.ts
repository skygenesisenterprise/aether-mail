"use client";

import { useTranslations as useNextTranslations } from "next-intl";
import { useParams } from "next/navigation";

export function useTranslations() {
  const locale = String(useParams()?.locale || "en");
  return useNextTranslations(locale);
}

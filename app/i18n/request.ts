import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import fr from "../messages/fr.json";
// import en from "../messages/en.json";

const messages = {
  fr,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale = locale && locale in messages ? locale : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: messages[resolvedLocale as keyof typeof messages],
  };
});

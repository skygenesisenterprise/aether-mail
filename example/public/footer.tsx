import Link from "next/link";
import { locales, type Locale } from "@/lib/locale";
import { footerLinksApi, type FooterLink } from "@/lib/api/client";

interface FooterProps {
  locale?: Locale;
}

interface FooterLinkGroup {
  title: string;
  links: { name: string; href: string }[];
}

async function getFooterLinks(locale: string): Promise<Record<string, FooterLinkGroup>> {
  const prefix = `/${locale}`;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/footer-links?locale=${locale}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch footer links");
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return getDefaultFooterLinks(locale);
    }

    const links = data.data as FooterLink[];

    const grouped = links
      .filter((link: FooterLink) => link.isVisible)
      .reduce((acc: Record<string, FooterLinkGroup>, link: FooterLink) => {
        if (!acc[link.category]) {
          acc[link.category] = { title: link.title, links: [] };
        }
        const href = link.href.startsWith("http") ? link.href : `${prefix}${link.href}`;
        acc[link.category].links.push({ name: link.name, href });
        return acc;
      }, {});

    Object.keys(grouped).forEach((key) => {
      grouped[key].links.sort((a, b) => {
        const linkA = links.find((l: FooterLink) => l.name === a.name);
        const linkB = links.find((l: FooterLink) => l.name === b.name);
        return (linkA?.position || 0) - (linkB?.position || 0);
      });
    });

    return grouped;
  } catch (error) {
    console.error("Error fetching footer links:", error);
    return getDefaultFooterLinks(locale);
  }
}

function getDefaultFooterLinks(locale: string): Record<string, FooterLinkGroup> {
  const prefix = `/${locale}`;
  return {
    dossiers: {
      title: "Dossiers d'actualité",
      links: [
        { name: "Donald Trump", href: `${prefix}/dossiers/donald-trump` },
        { name: "Guerre en Ukraine", href: `${prefix}/dossiers/guerre-ukraine` },
        { name: "Affaire Epstein", href: `${prefix}/dossiers/affaire-epstein` },
        { name: "Iran", href: `${prefix}/dossiers/iran` },
        { name: "Pouvoir d'achat", href: `${prefix}/dossiers/pouvoir-achat` },
      ],
    },
    series: {
      title: "Séries",
      links: [
        { name: "Dans les comptes", href: `${prefix}/series/comptes` },
        { name: "Dans le lit", href: `${prefix}/series/lit` },
        { name: "Dans la tête", href: `${prefix}/series/tete` },
        { name: "Dans la nouvelle vie", href: `${prefix}/series/nouvelle-vie` },
        { name: "Dans le cœur", href: `${prefix}/series/coeur` },
        { name: "Les quiz d'Etheria Times", href: `${prefix}/quiz` },
      ],
    },
    sports: {
      title: "Sports",
      links: [
        { name: "PSG", href: `${prefix}/sport/psg` },
        { name: "Ligue des champions", href: `${prefix}/sport/ligue-champions` },
        { name: "Ligue 1", href: `${prefix}/sport/ligue-1` },
        { name: "Paris FC", href: `${prefix}/sport/paris-fc` },
        { name: "Ousmane Dembélé", href: `${prefix}/sport/dembele` },
        { name: "Kylian Mbappé", href: `${prefix}/sport/mbappe` },
        { name: "Coupe du monde 2026", href: `${prefix}/sport/cdm-2026` },
      ],
    },
    politique: {
      title: "Politique",
      links: [
        { name: "Emmanuel Macron", href: `${prefix}/politique/macron` },
        { name: "Sébastien Lecornu", href: `${prefix}/politique/lecornu` },
        { name: "Municipales 2026", href: `${prefix}/politique/municipales-2026` },
        { name: "Municipales 2026 à Paris", href: `${prefix}/politique/municipales-2026-paris` },
        {
          name: "Résultats municipales 2026",
          href: `${prefix}/politique/resultats-municipales-2026`,
        },
        { name: "Présidentielle 2027", href: `${prefix}/politique/presidentielle-2027` },
      ],
    },
    etudiant: {
      title: "Étudiant",
      links: [
        { name: "Étudiant", href: `${prefix}/etudiant` },
        { name: "Enseignement supérieur", href: `${prefix}/etudiant/seignement-superieur` },
        { name: "Lycée", href: `${prefix}/etudiant/lycee` },
        { name: "Collège", href: `${prefix}/etudiant/college` },
        { name: "Guide métiers", href: `${prefix}/etudiant/guide-metiers` },
        { name: "Vie étudiante", href: `${prefix}/etudiant/vie-etudiante` },
      ],
    },
    sorties: {
      title: "Sorties",
      links: [
        { name: "Agenda sorties", href: `${prefix}/sorties/agenda` },
        { name: "Jobs Stages", href: `${prefix}/sorties/jobs-stages` },
      ],
    },
    videos: {
      title: "Vidéos",
      links: [
        { name: "Podcasts & Vidéos", href: `${prefix}/videos` },
        { name: "Crime story", href: `${prefix}/videos/crime-story` },
        { name: "Code source", href: `${prefix}/videos/code-source` },
        { name: "Food-checking", href: `${prefix}/videos/food-checking` },
        { name: "Biclou", href: `${prefix}/videos/biclou` },
      ],
    },
    services: {
      title: "Services",
      links: [
        { name: "Bons plans", href: `${prefix}/services/bons-plans` },
        { name: "Sélection du Guide d'achat", href: `${prefix}/services/guide-achat` },
        { name: "Météo", href: `${prefix}/services/meteo` },
      ],
    },
  };
}

interface LinkColumnProps {
  title: string;
  links: readonly { name: string; href: string }[];
}

function LinkColumn({ title, links }: LinkColumnProps) {
  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors block"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("twitter") || normalizedName.includes("x.com")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (normalizedName.includes("facebook")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (normalizedName.includes("instagram")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (normalizedName.includes("youtube")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  if (normalizedName.includes("discord")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }

  if (normalizedName.includes("twitch")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.571 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    );
  }

  if (normalizedName.includes("github")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (normalizedName.includes("linkedin")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 6v2H5v11h11v-2h-6v-2h6v-2h-2V6h-4z" />
    </svg>
  );
}

const countryNames: Record<string, string> = {
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
};

export async function Footer({ locale = "fr" }: FooterProps) {
  const currentLocale = locales.find((l) => l.code === locale);
  const regionName = currentLocale?.label.split(" ")[0] || "International";
  const countryName = countryNames[currentLocale?.country || ""] || "International";
  const footerLinks = await getFooterLinks(locale);
  const prefix = `/${locale}`;

  const subscriptionLinks = footerLinks.subscription?.links || [
    { name: "Abonnement", href: `${prefix}/abonnement` },
    { name: "Newsletter", href: `${prefix}/newsletter` },
    { name: "Application mobile", href: "/app" },
    { name: "Archives", href: `${prefix}/archives` },
  ];

  const legalLinks = footerLinks.legal?.links || [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "CGU", href: "/cgu" },
    { name: "Politique de confidentialité", href: "/confidentialite" },
    { name: "Gestion des cookies", href: "/cookies" },
  ];

  const socialLinks = footerLinks.social?.links || [
    { name: "Twitter", href: "https://x.com/etheriatimes" },
    { name: "Facebook", href: "https://facebook.com/etheriatimes" },
    { name: "Instagram", href: "https://instagram.com/etheriatimes" },
    { name: "YouTube", href: "https://youtube.com/@etheriatimes" },
    { name: "Discord", href: "https://discord.gg/etheriatimes" },
    { name: "Twitch", href: "https://twitch.tv/etheriatimes" },
    { name: "GitHub", href: "https://github.com/etheriatimes" },
  ];

  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
          <LinkColumn
            title={footerLinks.dossiers?.title || "Dossiers d'actualité"}
            links={footerLinks.dossiers?.links || []}
          />
          <LinkColumn
            title={footerLinks.series?.title || "Séries"}
            links={footerLinks.series?.links || []}
          />
          <LinkColumn
            title={footerLinks.sports?.title || "Sports"}
            links={footerLinks.sports?.links || []}
          />
          <LinkColumn
            title={footerLinks.politique?.title || "Politique"}
            links={footerLinks.politique?.links || []}
          />
          <LinkColumn
            title={footerLinks.etudiant?.title || "Étudiant"}
            links={footerLinks.etudiant?.links || []}
          />
          <LinkColumn
            title={footerLinks.sorties?.title || "Sorties"}
            links={footerLinks.sorties?.links || []}
          />
          <LinkColumn
            title={footerLinks.videos?.title || "Vidéos"}
            links={footerLinks.videos?.links || []}
          />
          <LinkColumn
            title={footerLinks.services?.title || "Services"}
            links={footerLinks.services?.links || []}
          />
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div>
              <Link href="/" className="inline-block">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  The Etheria Times - {regionName}
                </h2>
              </Link>
              <p className="mt-4 text-sm text-foreground/70 max-w-md">
                Votre fenêtre sur le monde — enquêtes, analyses et informations vérifiées pour
                révéler et comprendre les réalités qui façonnent notre société
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                  Abonnement
                </h4>
                <ul className="space-y-2">
                  {subscriptionLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                  Informations légales
                </h4>
                <ul className="space-y-2">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                  Suivez-nous
                </h4>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="text-foreground/60 hover:text-foreground transition-colors"
                      aria-label={social.name}
                    >
                      <SocialIcon name={social.name} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/60">
              © 2026 The Etheria Times {countryName}. All rights reserved.{""}
              <span className="hidden sm:inline"> · </span>
              <span className="block sm:inline mt-1 sm:mt-0">
                <Link
                  href="https://skygenesisenterprise.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  A Sky Genesis Enterprise company
                </Link>
              </span>
            </p>
            <p className="text-sm text-foreground/60">
              <Link href="/pgp" className="hover:underline">
                Vérifiez notre clé PGP publique pour vous assurer de l&apos;authenticité du site
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

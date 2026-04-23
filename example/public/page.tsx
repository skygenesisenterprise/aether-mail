import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons/GitHubIcon";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { CodeBlock } from "@/components/public/CodeBlock";
import {
  Shield,
  Lock,
  Users,
  Key,
  Fingerprint,
  Zap,
  ArrowRight,
  Server,
  Globe,
  Code2,
  Building2,
  CheckCircle2,
  GitBranch,
  Database,
  Cloud,
  FileText,
  BookOpen,
  Calendar,
  BarChart3,
  Clock,
  X,
  Landmark,
  ShoppingCart,
  HeartPulse,
  Building,
} from "lucide-react";

export default async function PublicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Public" });

  const capabilities = [
    {
      icon: Lock,
      title: t("capabilities.oauth.title"),
      description: t("capabilities.oauth.description"),
    },
    {
      icon: Fingerprint,
      title: t("capabilities.mfa.title"),
      description: t("capabilities.mfa.description"),
    },
    {
      icon: Users,
      title: t("capabilities.federation.title"),
      description: t("capabilities.federation.description"),
    },
    {
      icon: Key,
      title: t("capabilities.authorization.title"),
      description: t("capabilities.authorization.description"),
    },
    {
      icon: Server,
      title: t("capabilities.selfHosted.title"),
      description: t("capabilities.selfHosted.description"),
    },
    {
      icon: Globe,
      title: t("capabilities.sessions.title"),
      description: t("capabilities.sessions.description"),
    },
  ];

  const metrics = [
    { value: "< 15ms", label: t("metrics.tokenLatency") },
    { value: "99.99%", label: t("metrics.sla") },
    { value: "10M+", label: t("metrics.authentications") },
    { value: "Zero", label: t("metrics.vendorLockin") },
  ];

  const deploymentOptions = [
    {
      icon: Database,
      title: t("deployment.onPremise"),
      description: t("deployment.onPremiseDesc"),
    },
    {
      icon: Cloud,
      title: t("deployment.cloudNative"),
      description: t("deployment.cloudNativeDesc"),
    },
    {
      icon: GitBranch,
      title: t("deployment.hybrid"),
      description: t("deployment.hybridDesc"),
    },
  ];

  const sdkSupport = [
    { name: "Node.js", category: "Backend" },
    { name: "Go", category: "Backend" },
    { name: "Python", category: "Backend" },
    { name: "Java", category: "Backend" },
    { name: ".NET", category: "Backend" },
    { name: "React", category: "Frontend" },
    { name: "Vue", category: "Frontend" },
    { name: "Angular", category: "Frontend" },
    { name: "iOS", category: "Mobile" },
    { name: "Android", category: "Mobile" },
  ];

  const sampleCode = [
    {
      language: "typescript",
      filename: "auth.ts",
      code: `import { AetherClient } from '@aether-identity/node';

const aether = new AetherClient({
  domain: 'auth.yourcompany.com',
  clientId: process.env.AETHER_CLIENT_ID,
  clientSecret: process.env.AETHER_CLIENT_SECRET,
});

// Verify access token
const { user, permissions } = await aether.verify(
  request.headers.authorization
);

// Check specific permission
if (permissions.includes('read:documents')) {
  // Authorized access
}`,
    },
    {
      language: "python",
      filename: "auth.py",
      code: `from aether_client import AetherClient

aether = AetherClient(
    domain='auth.yourcompany.com',
    client_id=os.environ['AETHER_CLIENT_ID'],
    client_secret=os.environ['AETHER_CLIENT_SECRET'],
)

# Verify access token
user, permissions = await aether.verify(
    request.headers['authorization']
)

# Check specific permission
if 'read:documents' in permissions:
    # Authorized access`,
    },
  ];

  const complianceStandards = [
    "SOC 2 Type II",
    "GDPR",
    "HIPAA",
    "ISO 27001",
    "PCI DSS",
    "FedRAMP Ready",
  ];

  const comparison = [
    {
      feature: t("comparison.selfHosted"),
      aether: true,
      keycloak: true,
      auth0: false,
      okta: false,
    },
    { feature: t("comparison.oauth"), aether: true, keycloak: true, auth0: true, okta: true },
    { feature: t("comparison.mfa"), aether: true, keycloak: true, auth0: true, okta: true },
    { feature: t("comparison.federation"), aether: true, keycloak: true, auth0: true, okta: true },
    { feature: t("comparison.rbac"), aether: true, keycloak: true, auth0: true, okta: true },
    { feature: t("comparison.audit"), aether: true, keycloak: true, auth0: true, okta: true },
    { feature: t("comparison.noLockin"), aether: true, keycloak: true, auth0: false, okta: false },
    {
      feature: t("comparison.sla"),
      aether: "99.99%",
      keycloak: "N/A",
      auth0: "99.9%",
      okta: "99.9%",
    },
  ];

  const industries = [
    {
      icon: HeartPulse,
      title: t("industries.healthcare"),
      description: t("industries.healthcareDesc"),
    },
    {
      icon: Landmark,
      title: t("industries.finance"),
      description: t("industries.financeDesc"),
    },
    {
      icon: Building,
      title: t("industries.government"),
      description: t("industries.governmentDesc"),
    },
    {
      icon: ShoppingCart,
      title: t("industries.ecommerce"),
      description: t("industries.ecommerceDesc"),
    },
  ];

  const faqs = [
    {
      question: t("faq.keycloak.title"),
      answer: t("faq.keycloak.answer"),
    },
    {
      question: t("faq.migrate.title"),
      answer: t("faq.migrate.answer"),
    },
    {
      question: t("faq.offline.title"),
      answer: t("faq.offline.answer"),
    },
    {
      question: t("faq.free.title"),
      answer: t("faq.free.answer"),
    },
    {
      question: t("faq.updates.title"),
      answer: t("faq.updates.answer"),
    },
  ];

  const resources = [
    {
      icon: FileText,
      title: t("resources.whitepaper"),
      description: t("resources.whitepaperDesc"),
    },
    {
      icon: BookOpen,
      title: t("resources.ebook"),
      description: t("resources.ebookDesc"),
    },
    {
      icon: Calendar,
      title: t("resources.webinar"),
      description: t("resources.webinarDesc"),
    },
    {
      icon: BarChart3,
      title: t("resources.caseStudy"),
      description: t("resources.caseStudyDesc"),
    },
  ];

  const teamMembers = [
    { nameKey: "team.alex", roleKey: "team.alexRole", image: "AC" },
    { nameKey: "team.sarah", roleKey: "team.sarahRole", image: "SM" },
    { nameKey: "team.james", roleKey: "team.jamesRole", image: "JW" },
    { nameKey: "team.emily", roleKey: "team.emilyRole", image: "ED" },
  ];

  const recentUpdates = [
    { version: "v2.4.0", dateKey: "updates.v240", descKey: "updates.v240Desc" },
    { version: "v2.3.0", dateKey: "updates.v230", descKey: "updates.v230Desc" },
    { version: "v2.2.0", dateKey: "updates.v220", descKey: "updates.v220Desc" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header locale={locale as import("@/lib/locale").Locale} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                {t("hero.badge")}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-tight text-balance">
                {t("hero.title")}
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                {t("hero.description")}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link href={`/${locale}/docs`}>
                  <Button size="lg" className="gap-2 h-12 px-6 text-base">
                    {t("hero.ctaDocs")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="https://github.com/skygenesisenterprise/aether-identity">
                  <Button variant="outline" size="lg" className="gap-2 h-12 px-6 text-base">
                    <GitHubIcon className="h-4 w-4" />
                    {t("hero.ctaGithub")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-16 border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="text-3xl sm:text-4xl font-semibold text-foreground">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("capabilities.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("capabilities.description")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {capabilities.map((capability) => (
                <div key={capability.title} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                      <capability.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{capability.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-13">
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 lg:py-28 border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("comparison.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("comparison.description")}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-150">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                      {t("comparison.feature")}
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">
                      Identity
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">
                      Keycloak
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">
                      Auth0
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">
                      Okta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.feature} className="border-b border-border/50">
                      <td className="py-4 px-4 text-sm text-foreground">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.aether === "boolean" ? (
                          row.aether ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-medium text-foreground">{row.aether}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.keycloak === true ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : row.keycloak === false ? (
                          <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.keycloak}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.auth0 === true ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : row.auth0 === false ? (
                          <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.auth0}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.okta === true ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : row.okta === false ? (
                          <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.okta}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Code Example Section */}
        <section className="py-20 lg:py-28 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-balance">
                  {t("code.title")}
                </h2>
                <p className="mt-4 text-lg text-background/70 leading-relaxed">
                  {t("code.description")}
                </p>
                <div className="mt-8">
                  <div className="flex flex-wrap gap-2">
                    {sdkSupport.map((sdk) => (
                      <span
                        key={sdk.name}
                        className="px-3 py-1.5 text-sm bg-background/10 rounded-md text-background/80"
                      >
                        {sdk.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8">
                  <Link href={`/${locale}/docs/quickstarts`}>
                    <Button variant="secondary" size="lg" className="gap-2">
                      <Code2 className="h-4 w-4" />
                      {t("code.cta")}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <CodeBlock samples={sampleCode} defaultLanguage="typescript" />
              </div>
            </div>
          </div>
        </section>

        {/* Deployment Options */}
        <section className="py-20 lg:py-28 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("deployment.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("deployment.description")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {deploymentOptions.map((option) => (
                <div
                  key={option.title}
                  className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors"
                >
                  <option.icon className="h-8 w-8 text-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Use Cases */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("industries.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("industries.description")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {industries.map((industry) => (
                <div
                  key={industry.title}
                  className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors"
                >
                  <industry.icon className="h-8 w-8 text-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{industry.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {industry.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="py-20 lg:py-28 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                  {t("compliance.title")}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  {t("compliance.description")}
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {complianceStandards.map((standard) => (
                    <div key={standard} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-sm text-foreground">{standard}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-lg bg-muted/50 border border-border">
                  <Shield className="h-8 w-8 text-foreground mb-3" />
                  <div className="text-2xl font-semibold text-foreground">AES-256</div>
                  <div className="text-sm text-muted-foreground">
                    {t("compliance.encryptionRest")}
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-muted/50 border border-border">
                  <Lock className="h-8 w-8 text-foreground mb-3" />
                  <div className="text-2xl font-semibold text-foreground">TLS 1.3</div>
                  <div className="text-sm text-muted-foreground">
                    {t("compliance.encryptionTransit")}
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-muted/50 border border-border">
                  <Building2 className="h-8 w-8 text-foreground mb-3" />
                  <div className="text-2xl font-semibold text-foreground">
                    {t("compliance.airGap")}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("compliance.airGapDesc")}</div>
                </div>
                <div className="p-6 rounded-lg bg-muted/50 border border-border">
                  <Zap className="h-8 w-8 text-foreground mb-3" />
                  <div className="text-2xl font-semibold text-foreground">
                    {t("compliance.auditLogs")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("compliance.auditLogsDesc")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 lg:py-28 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("faq.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("faq.description")}
              </p>
            </div>
            <FaqAccordion faqs={faqs} />
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-20 lg:py-28 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("resources.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("resources.description")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource) => (
                <div
                  key={resource.title}
                  className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors cursor-pointer"
                >
                  <resource.icon className="h-8 w-8 text-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {resource.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Partners */}
        <section className="py-20 lg:py-28 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("partners.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("partners.description")}
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
              <div className="text-lg font-semibold text-muted-foreground/60">AWS</div>
              <div className="text-lg font-semibold text-muted-foreground/60">Azure</div>
              <div className="text-lg font-semibold text-muted-foreground/60">Google Cloud</div>
              <div className="text-lg font-semibold text-muted-foreground/60">Kubernetes</div>
              <div className="text-lg font-semibold text-muted-foreground/60">Docker</div>
              <div className="text-lg font-semibold text-muted-foreground/60">Terraform</div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 lg:py-28 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("team.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("team.description")}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.nameKey}
                  className="p-6 rounded-lg border border-border bg-card text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-semibold text-foreground">{member.image}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{t(member.nameKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(member.roleKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("updates.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("updates.description")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentUpdates.map((update) => (
                <div
                  key={update.version}
                  className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t(update.dateKey)}</span>
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-2">{update.version}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(update.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {t("cta.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{t("cta.description")}</p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`/${locale}/docs`}>
                  <Button size="lg" className="gap-2 h-12 px-8 text-base">
                    {t("cta.getStarted")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/${locale}/contact`}>
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    {t("cta.contactSales")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale as "fr" | "be_fr" | "be_nl" | "ch_fr"} />
    </div>
  );
}

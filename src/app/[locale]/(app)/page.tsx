import { auth } from '@/auth';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { listActiveServices } from '@/services/catalog.service';
import { Container } from '@/components/layout/container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceCard } from '@/components/services/service-card';

export default async function HomePage() {
  // Server component: fetch data + translations here, pass primitives down.
  const t = await getTranslations("home");
  const session = await auth();
  const services = (await listActiveServices()).slice(0, 6); // "popular" strip

  // ---- Derive a view-model from role ONCE, then render a single markup below ----
  const user = session?.user ?? null;
  const isGuest = !user;
  const isTechnician = user?.role === "technician";

  const hero = user
    ? {
        title: t("welcomeTitle", { name: user.name ?? "" }),
        subtitle: isTechnician ? t("heroTechSub") : t("heroCustomerSub"),
      }
    : { title: t("heroTitle"), subtitle: t("heroSubtitle") };

  // CTA: technicians already sell, so point them to their dashboard instead.

  const cta = isTechnician
    ? {
        title: t("ctaTechTitle"),
        sub: t("ctaTechSub"),
        button: t("ctaTechButton"),
        href: "/dashboard",
      }
    : {
        title: t("ctaTitle"),
        sub: t("ctaSub"),
        button: t("ctaButton"),
        href: "/technician/profile",
      };

  // Config-driven steps: render from data, not repeated JSX.
  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <>
      {/* ---- HERO (role-aware heading + action) ---- */}
      <section className="border-b border-border bg-card">
        <Container size="xl" gutter="lg">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground text-balance">
              {hero.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {hero.subtitle}
            </p>

            {isTechnician ? (
              // Technicians don't search to hire — give them a primary action instead.
              <Link
                href="/technician/services/new"
                className={`mt-6 h-11 px-6 ${buttonVariants()}`}
              >
                {t("postService")}
              </Link>
            ) : (
              // Guests + customers: the search entry point (static for now).
              <div className="mt-6 flex max-w-xl gap-2">
                <Input
                  type="search"
                  placeholder={t("searchPlaceholder")}
                  className="h-11 flex-1"
                />
                <Button className="h-11 px-6">{t("searchButton")}</Button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ---- POPULAR SERVICES (same for everyone) ---- */}
      <section className="bg-background">
        <Container size="xl" gutter="lg">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {t("popularServices")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("popularServicesSub")}
            </p>
          </div>

          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-strong p-14 text-center">
              <p className="font-medium text-foreground">{t("emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("emptySub")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {services.map((s) => (
                <ServiceCard
                  key={s.id}
                  href="/services"
                  title={s.title}
                  description={s.description}
                  basePriceAmount={s.basePriceAmount}
                  technicianName={s.technician.displayName}
                  labels={{ priceFrom: t("priceFrom"), by: t("by") }}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ---- HOW IT WORKS (onboarding — guests only) ---- */}
      {isGuest && (
        <section className="border-t border-border bg-card">
          <Container size="xl" gutter="lg">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              {t("howTitle")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---- CTA (role-aware) ---- */}
      <section className="bg-background">
        <Container size="xl" gutter="lg">
          <div className="flex flex-col items-start gap-4 rounded-2xl bg-primary px-8 py-10 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{cta.title}</h2>
              <p className="mt-1 text-primary-foreground/80">{cta.sub}</p>
            </div>
            <Link
              href={cta.href}
              className={buttonVariants({ variant: "secondary" })}
            >
              {cta.button}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

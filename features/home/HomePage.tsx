import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight, ArrowUpRight, BadgeCheck, BellRing, BookOpen, Dot,
  Languages, Mail, Map, MapPin, MessageCircle, Sparkles, Volume2,
} from "lucide-react";

import { dictionaries, homePath, localizePath, type Dictionary, type Locale } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { lifeStepHomePreview, type LifeStepHomePreview } from "@/messages/lifestep";
import { Button } from "@/components/ui/button";
import { HomeFaq } from "./components/HomeFaq";
import { HomeLanguageMenu } from "./components/HomeLanguageMenu";
import { HomeLocaleRedirect } from "./components/HomeLocaleRedirect";
import { HomeNavMenu } from "./components/HomeNavMenu";
import { HomeRevealObserver } from "./components/HomeRevealObserver";
import { HomeSurfaceScope } from "./components/HomeSurfaceScope";
import { HomeThemeChrome } from "./components/HomeThemeChrome";
import { HomeThemeToggle } from "./components/HomeThemeToggle";

type HomeContent = Dictionary["homePage"];

const container = "mx-auto w-full max-w-[1200px] px-4 lg:px-6";
const navLinkClass = "flex min-h-10 items-center whitespace-nowrap py-1 transition hover:text-primary";
const LIFE_STEP_SLOGAN = "Step into real life";

export function HomePage({ locale, redirect = false }: { locale: Locale; redirect?: boolean }) {
  const dictionary = dictionaries[locale];
  const copy = dictionary.homePage;
  const preview = lifeStepHomePreview[locale];
  const canonicalPath = homePath("/", locale);
  const appHref = localizePath("/", locale);
  const tagline = copy.title.match(/^(.*?)\s+[-—]\s+(.*)$/)?.[2] ?? copy.footer;
  const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, alternateName: LIFE_STEP_SLOGAN, description: copy.intro, url: `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`, inLanguage: locale };
  const appJsonLd = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: SITE_NAME, applicationCategory: "EducationalApplication", operatingSystem: "Web Browser", description: copy.intro, url: `${SITE_URL}${appHref}` };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd).replace(/</g, "\\u003c") }} />
    {redirect ? <HomeLocaleRedirect /> : null}
    <HomeSurfaceScope />
    <main className="relative min-h-screen overflow-x-clip bg-transparent text-foreground">
      <HomeRevealObserver instanceKey={locale} />
      <HomeThemeChrome>
        <header className="app-top-chrome sticky top-0 z-40 bg-transparent pb-2 pt-(--app-safe-header-top) md:py-[1.35rem]">
          <nav className={`${container} flex h-10 items-center justify-between gap-3 lg:gap-4`} aria-label="Main navigation">
            <Link href={canonicalPath} className="home-header-brand inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap text-xl font-bold tracking-[-0.04em] text-[#d3001c] dark:text-white" aria-label="LifeStep home">
              <span className="grid size-10 place-items-center overflow-hidden rounded-[var(--radius-lg)] bg-[#d3001c]"><Image src="/logo.svg" alt="" width={40} height={40} priority /></span><span>LifeStep</span>
            </Link>
            <div className="ml-8 mr-auto hidden min-w-0 items-center gap-5 text-base font-bold text-muted-foreground xl:flex"><a className={`home-header-link ${navLinkClass}`} href="#overview">{copy.featuresKicker}</a><a className={`home-header-link ${navLinkClass}`} href="#faq">{copy.faqNav}</a></div>
            <div className="flex shrink-0 items-center gap-2">
              <HomeLanguageMenu locale={locale} /><HomeThemeToggle label={copy.themeLabel} />
              <Button asChild className="home-open-app-button hidden h-10 rounded-full px-4 xl:inline-flex"><Link href={appHref}>{copy.launchApp}<ArrowUpRight className="size-4" aria-hidden="true" /></Link></Button>
              <HomeNavMenu overviewLabel={copy.featuresKicker} faqLabel={copy.faqNav} launchLabel={copy.launchApp} appHref={appHref} />
            </div>
          </nav>
        </header>
      </HomeThemeChrome>

      <section className={`${container} grid items-start justify-items-center gap-10 pb-16 pt-8 lg:min-h-[520px] lg:grid-cols-[1.1fr_0.9fr] lg:justify-items-stretch lg:gap-10 lg:pb-4`}>
        <div className="relative z-10 w-full min-w-0 max-w-xl text-center lg:text-left">
          <HeroTitle title={copy.title} />
          <p className="mx-auto mt-6 max-w-lg text-left text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">{copy.intro}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
            <Link className="home-primary-cta inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-xl shadow-primary/25 transition hover:-translate-y-0.5" href={appHref}>{copy.getStarted}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
            <a className="inline-flex items-center gap-1.5 text-sm font-extrabold text-foreground transition hover:text-primary" href="#overview">{copy.explore}<ArrowDownRight className="size-4" aria-hidden="true" /></a>
          </div>
        </div>
        <JourneySignalPanel copy={copy} preview={preview} />
      </section>

      <section className={`${container} grid grid-cols-2 gap-3 lg:grid-cols-4`} aria-label="LifeStep at a glance">{copy.metrics.map((metric, index) => <MetricCard key={metric.label} metric={metric} index={index} />)}</section>

      <section className={`${container} pb-0 pt-20 sm:pt-28`}>
        <h2 className="mb-8 scroll-mt-[calc(var(--app-safe-header-top)+4rem)] text-3xl font-extrabold leading-tight tracking-[-0.05em] sm:mb-10 sm:text-4xl md:scroll-mt-24" id="overview">{copy.featuresKicker}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">{copy.features.map((feature, index) => <FeatureCard key={feature.title} feature={feature} index={index} />)}</div>
      </section>

      <section className={`${container} py-20 sm:py-28`}>
        <h2 className="mb-8 scroll-mt-[calc(var(--app-safe-header-top)+4rem)] text-3xl font-extrabold leading-tight tracking-[-0.05em] sm:mb-10 sm:text-4xl md:scroll-mt-24" id="faq">{copy.faqNav}</h2>
        <HomeFaq items={copy.faq} />
      </section>

      <footer className={`${container} flex min-h-28 flex-col items-center justify-center gap-5 border-t border-border py-7 text-center text-muted-foreground sm:flex-row sm:justify-between sm:text-left`}>
        <div className="inline-flex items-center gap-2.5"><span className="grid size-10 place-items-center overflow-hidden rounded-[var(--radius-lg)] bg-[#d3001c]"><Image src="/logo.svg" alt="" width={40} height={40} /></span><div className="grid gap-0.5 text-left"><strong className="text-sm text-[#d3001c] dark:text-white">LifeStep</strong><span className="text-[0.65rem]">{tagline}</span></div></div>
        <div className="grid justify-items-center gap-2 text-xs sm:justify-items-end">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-bold sm:justify-end"><Link className="hover:text-primary" href={`${localizePath("/about", locale)}?panel=app`}>{dictionary.profile.menu.aboutApp}</Link><Link className="hover:text-primary" href={`${localizePath("/about", locale)}?panel=privacy`}>{copy.privacyNav}</Link><Link className="hover:text-primary" href={`${localizePath("/about", locale)}?panel=terms`}>{copy.termsNav}</Link><Link className="hover:text-primary" href={`${localizePath("/about", locale)}?panel=feedback`}>{dictionary.profile.menu.feedback}</Link></div>
          <div className="flex items-center gap-1.5 text-[0.65rem]"><a className="home-social-link" href="https://x.com/EffortGo2024" target="_blank" rel="noreferrer" aria-label="X"><XMark className="size-4" /></a><a className="home-social-link" href="https://www.xiaohongshu.com/user/profile/5fa36065000000000101ffa5" target="_blank" rel="noreferrer" aria-label="小红书"><RedbookMark className="size-4" /></a><a className="home-social-link" href="mailto:lifestep@effortgo.xyz" aria-label="Email"><Mail className="size-4" aria-hidden="true" /></a><span className="ml-1 inline-flex items-center">© 2026 EffortGo <Dot className="size-4" aria-hidden="true" /> {process.env.APP_VERSION}</span></div>
        </div>
      </footer>
    </main>
  </>;
}

function HeroTitle({ title }: { title: string }) {
  const descriptor = title.match(/^(.*?)\s+[-—]\s+(.*)$/)?.[2] ?? title;
  return <h1 className="mx-auto max-w-full text-[clamp(2.35rem,4.3vw,4.2rem)] font-extrabold leading-none tracking-[-0.065em] lg:mx-0">{descriptor}</h1>;
}

function JourneySignalPanel({ copy, preview }: { copy: HomeContent; preview: LifeStepHomePreview }) {
  const steps: Array<[string, string, boolean]> = [["✓", preview.steps[0], true], ["2", preview.steps[1], true], ["3", preview.steps[2], false]];
  return <div data-home-reveal data-home-reveal-delay="120" className="relative min-h-[23rem] w-full min-w-0 overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-background via-card to-muted shadow-2xl shadow-foreground/10 dark:from-[#151d2c] dark:via-[#0f1622] dark:to-[#080c14] sm:min-h-[31rem] lg:min-h-[27rem] lg:w-[98%] lg:justify-self-end" aria-label={copy.features[0].title}>
    <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px)] [background-size:2.5rem_2.5rem] [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
    <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/15 sm:size-80" />
    <div className="absolute left-[10%] top-[15%] z-10 w-[70%] rounded-2xl border border-border bg-card/90 p-4 text-card-foreground shadow-2xl backdrop-blur-xl sm:left-[15%] sm:top-[13%]">
      <div className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-muted-foreground"><Map className="size-3.5 text-primary" />{preview.journey}<span className="ml-auto text-primary">3 / 12</span></div>
      <div className="relative mt-4 grid gap-3 before:absolute before:bottom-5 before:left-[1.05rem] before:top-5 before:w-px before:bg-border">{steps.map(([step, label, active], index) => <div className="relative z-10 flex items-center gap-3" key={label}><span className={`grid size-9 shrink-0 place-items-center rounded-full border-2 border-card text-xs font-extrabold ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{step}</span><strong className="text-sm">{label}</strong>{index === 1 ? <small className="ml-auto rounded-full bg-primary/10 px-2 py-1 text-[0.55rem] font-bold uppercase text-primary">{preview.current}</small> : null}</div>)}</div>
    </div>
    <div className="absolute bottom-[12%] right-[5%] z-20 w-[72%] rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur-xl sm:bottom-[14%] sm:right-[7%] sm:w-[68%]">
      <div className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-muted-foreground"><MessageCircle className="size-3.5 text-sky-500" />{preview.conversation}<span className="ml-auto text-lime-600">{preview.practiceMode}</span></div>
      <div className="mt-3 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3 text-sm font-semibold">{preview.phrase}<span className="mt-1 block text-xs font-normal text-muted-foreground">{preview.translation}</span></div>
      <button type="button" className="home-preview-play absolute -bottom-3 -right-3 grid size-10 place-items-center rounded-full bg-primary text-white shadow-lg" aria-label={preview.playPhrase}><Volume2 className="size-4" /></button>
    </div>
    <div className="absolute right-[7%] top-[7%] z-20 flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3 py-2 text-card-foreground shadow-xl backdrop-blur-xl"><BellRing className="size-4 text-primary" /><strong className="text-xs">{preview.nextStep}</strong></div>
    <div className="absolute bottom-[5%] left-[5%] z-10 inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-2 text-[0.59rem] font-bold text-card-foreground backdrop-blur-xl"><Languages className="size-3.5 text-sky-500" /><span>EN</span><span>中文</span><span>FR</span></div>
  </div>;
}

function MetricCard({ metric, index }: { metric: HomeContent["metrics"][number]; index: number }) {
  const Icon = [Languages, MapPin, MessageCircle, BookOpen][index] ?? Sparkles;
  const accent = [{ text: "text-primary", glow: "bg-primary/20" }, { text: "text-sky-500", glow: "bg-sky-500/20" }, { text: "text-lime-600", glow: "bg-lime-500/20" }, { text: "text-orange-500", glow: "bg-orange-500/20" }][index] ?? { text: "text-primary", glow: "bg-primary/20" };
  return <div data-home-reveal data-home-reveal-delay={String(index * 70)} className="relative flex min-h-[5.5rem] items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card/70 px-3.5 py-3.5 sm:min-h-[6.6rem] sm:px-5"><span className={`grid size-11 shrink-0 place-items-center rounded-2xl sm:size-14 ${accent.glow} ${accent.text}`}><Icon className="size-6 sm:size-7" strokeWidth={2.2} aria-hidden="true" /></span><div className="relative z-10 grid gap-1"><strong className={`whitespace-nowrap text-2xl leading-none tracking-[-0.08em] sm:text-3xl ${accent.text}`}>{metric.value}</strong><span className="text-[0.65rem] font-bold text-muted-foreground sm:text-xs">{metric.label}</span></div><span className={`absolute -bottom-8 -right-8 size-24 rounded-full blur-2xl ${accent.glow}`} /></div>;
}

function FeatureCard({ feature, index }: { feature: HomeContent["features"][number]; index: number }) {
  const Icon = [Map, BookOpen, MessageCircle, BadgeCheck, Sparkles, BellRing][index] ?? Sparkles;
  const isWide = index === 0 || index === 3;
  const responsiveOrder = ["order-1", "order-3", "order-4", "order-2", "order-5", "order-6"][index] ?? "";
  const label = feature.eyebrow.replace(/^\d+\s*\/\s*/, "");
  const accent = { red: { text: "text-primary", glow: "bg-primary/15" }, blue: { text: "text-sky-500", glow: "bg-sky-500/15" }, lime: { text: "text-lime-600", glow: "bg-lime-500/15" }, orange: { text: "text-orange-500", glow: "bg-orange-500/15" } }[feature.accent as "red" | "blue" | "lime" | "orange"] ?? { text: "text-primary", glow: "bg-primary/15" };
  return <article data-home-reveal data-home-reveal-delay={String((index % 3) * 80)} className={`group relative flex min-h-[14.5rem] flex-col overflow-hidden rounded-2xl border border-border bg-card/70 p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-foreground/10 ${responsiveOrder} lg:order-none ${isWide ? "lg:col-span-6 sm:p-6" : "lg:col-span-3"}`}>
    {isWide ? <Icon className={`pointer-events-none absolute -right-5 -top-6 size-36 opacity-[0.06] sm:size-44 ${accent.text}`} strokeWidth={1.25} aria-hidden="true" /> : null}
    <div className="relative z-10 flex items-center gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${accent.glow} ${accent.text}`}><Icon className="size-5" strokeWidth={2.2} aria-hidden="true" /></span><span className={`text-lg font-extrabold uppercase tracking-[0.025em] ${accent.text}`}>{label}</span></div>
    <h3 className={`relative z-10 mt-6 text-xl font-extrabold leading-[1.08] tracking-[-0.045em] ${isWide ? "lg:max-w-[18ch] lg:text-3xl" : ""}`}>{feature.title}</h3>
    <p className={`relative z-10 mt-3 text-sm leading-6 text-muted-foreground ${isWide ? "max-w-md" : "max-w-xs"}`}>{feature.body}</p>
    <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-5">{feature.tags.map((tag) => <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${accent.glow} ${accent.text}`} key={tag}>{tag}</span>)}</div>
    <span className={`pointer-events-none absolute -bottom-16 -right-12 size-40 rounded-full opacity-80 blur-3xl ${accent.glow}`} />
  </article>;
}

function XMark({ className }: { className?: string }) {
  return <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.9 2h3.3l-7.2 8.24L23.5 22h-6.64l-5.2-6.8L5.72 22H2.4l7.7-8.8L2 2h6.8l4.7 6.21L18.9 2Zm-1.16 17.93h1.83L7.81 3.96H5.85l11.89 15.97Z" /></svg>;
}

function RedbookMark({ className }: { className?: string }) {
  return <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M22.405 9.879c.002.016.01.02.07.019h.725a.797.797 0 0 0 .78-.972a.794.794 0 0 0-.884-.618.795.795 0 0 0-.692.794c0 .101-.002.666.001.777m-11.509 4.808c-.203.001-1.353.004-1.685.003a2.5 2.5 0 0 1-.766-.126.025.025 0 0 0-.03.014L7.7 16.127a.025.025 0 0 0 .01.032c.111.06.336.124.495.124c.66.01 1.32.002 1.981 0q.017 0 .023-.015l.712-1.545a.025.025 0 0 0-.024-.036ZM.477 9.91c-.071 0-.076.002-.076.01l-.01.08c-.027.397-.038.495-.234 3.06c-.012.24-.034.389-.135.607c-.026.057-.033.042.003.112c.046.092.681 1.523.787 1.74c.008.015.011.02.017.02c.008 0 .033-.026.047-.044q.219-.282.371-.606c.306-.635.44-1.325.486-1.706c.014-.11.021-.22.03-.33l.204-2.616l.022-.293c.003-.029 0-.033-.03-.034zm7.203 3.757a1.4 1.4 0 0 1-.135-.607c-.004-.084-.031-.39-.235-3.06a.4.4 0 0 0-.01-.082c-.004-.011-.052-.008-.076-.008h-1.48c-.03.001-.034.005-.03.034l.021.293q.114 1.473.233 2.946c.05.4.186 1.085.487 1.706c.103.215.223.419.37.606c.015.018.037.051.048.049c.02-.003.742-1.642.804-1.765c.036-.07.03-.055.003-.112m3.861-.913h-.872a.126.126 0 0 1-.116-.178l1.178-2.625a.025.025 0 0 0-.023-.035l-1.318-.003a.148.148 0 0 1-.135-.21l.876-1.954a.025.025 0 0 0-.023-.035h-1.56q-.017 0-.024.015l-.926 2.068c-.085.169-.314.634-.399.938a.5.5 0 0 0-.02.191a.46.46 0 0 0 .23.378a1 1 0 0 0 .46.119h.59c.041 0-.688 1.482-.834 1.972a.5.5 0 0 0-.023.172a.47.47 0 0 0 .23.398c.15.092.342.12.475.12l1.66-.001q.017 0 .023-.015l.575-1.28a.025.025 0 0 0-.024-.035m-6.93-4.937H3.1a.032.032 0 0 0-.034.033c0 1.048-.01 2.795-.01 6.829c0 .288-.269.262-.28.262h-.74c-.04.001-.044.004-.04.047c.001.037.465 1.064.555 1.263c.01.02.03.033.051.033c.157.003.767.009.938-.014c.153-.02.3-.06.438-.132c.3-.156.49-.419.595-.765c.052-.172.075-.353.075-.533q.003-3.495-.007-6.991a.03.03 0 0 0-.032-.032zm11.784 6.896q-.002-.02-.024-.022h-1.465c-.048-.001-.049-.002-.05-.049v-4.66c0-.072-.005-.07.07-.07h.863c.08 0 .075.004.075-.074V8.393c0-.082.006-.076-.08-.076h-3.5c-.064 0-.075-.006-.075.073v1.445c0 .083-.006.077.08.077h.854c.075 0 .07-.004.07.07v4.624c0 .095.008.084-.085.084c-.37 0-1.11-.002-1.304 0c-.048.001-.06.03-.06.03l-.697 1.519s-.014.025-.008.036s.013.008.058.008q2.622.003 5.243.002c.03-.001.034-.006.035-.033zm4.177-3.43q0 .021-.02.024c-.346.006-.692.004-1.037.004q-.021-.003-.022-.024q-.006-.651-.01-1.303c0-.072-.006-.071.07-.07l.733-.003c.041 0 .081.002.12.015c.093.025.16.107.165.204c.006.431.002 1.153.001 1.153m2.67.244a1.95 1.95 0 0 0-.883-.222h-.18c-.04-.001-.04-.003-.042-.04V10.21q.001-.198-.025-.394a1.8 1.8 0 0 0-.153-.53a1.53 1.53 0 0 0-.677-.71a2.2 2.2 0 0 0-1-.258c-.153-.003-.567 0-.72 0c-.07 0-.068.004-.068-.065V7.76c0-.031-.01-.041-.046-.039H17.93s-.016 0-.023.007q-.008.008-.008.023v.546c-.008.036-.057.015-.082.022h-.95c-.022.002-.028.008-.03.032v1.481c0 .09-.004.082.082.082h.913c.082 0 .072.128.072.128v1.148s.003.117-.06.117h-1.482c-.068 0-.06.082-.06.082v1.445s-.01.068.064.068h1.457c.082 0 .076-.006.076.079v3.225c0 .088-.007.081.082.081h1.43c.09 0 .082.007.082-.08v-3.27c0-.029.006-.035.033-.035l2.323-.003a.7.7 0 0 1 .28.061a.46.46 0 0 1 .274.407c.008.395.003.79.003 1.185c0 .259-.107.367-.33.367h-1.218c-.023.002-.029.008-.028.033q.276.655.57 1.303a.05.05 0 0 0 .04.026c.17.005.34.002.51.003c.15-.002.517.004.666-.01a2 2 0 0 0 .408-.075c.59-.18.975-.698.976-1.313v-1.981q.001-.191-.034-.38c0 .078-.029-.641-.724-.998" /></svg>;
}

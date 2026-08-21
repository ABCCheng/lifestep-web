import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, ChevronRight, Map, MessageCircle, Play, Sparkles, Volume2 } from "lucide-react";
import { dictionaries, homePath, type Locale } from "@/lib/i18n";
import { HomeLanguageMenu } from "./components/HomeLanguageMenu";
import { HomeLocaleRedirect } from "./components/HomeLocaleRedirect";
import { HomeNavMenu } from "./components/HomeNavMenu";
import { HomeSurfaceScope } from "./components/HomeSurfaceScope";
import { HomeThemeToggle } from "./components/HomeThemeToggle";
import { HomeFaq } from "./components/HomeFaq";

const stages = [["🛬", "Arrive"], ["🧾", "Settle"], ["🏠", "Housing"], ["🏦", "Finances"], ["🚇", "Get around"], ["🏥", "Healthcare"], ["💼", "Find a job"], ["🌎", "Community"]];

export function HomePage({ locale, redirect = false }: { locale: Locale; redirect?: boolean }) {
  const copy = dictionaries[locale].homePage;
  const dictionary = dictionaries[locale];
  return <>
    {redirect ? <HomeLocaleRedirect /> : null}<HomeSurfaceScope />
    <main className="marketing home-marketing">
      <header className="app-top-chrome home-header">
        <nav className="home-container home-header-inner" aria-label="Main navigation">
          <Link href={homePath("/", locale)} className="home-brand" aria-label="LifeStep home"><Image src="/logo.svg" alt="" width={40} height={40} priority /><span>LifeStep</span></Link>
          <div className="home-desktop-nav"><a href="#how">{copy.featuresKicker}</a><a href="#faq">{copy.faqNav}</a></div>
          <div className="home-header-actions"><HomeLanguageMenu locale={locale} /><HomeThemeToggle label={copy.themeLabel} /><Link className="home-launch-button" href="/app">{copy.launchApp}<ArrowRight /></Link><HomeNavMenu overviewLabel={copy.featuresKicker} faqLabel={copy.faqNav} launchLabel={copy.launchApp} /></div>
        </nav>
      </header>

      <section className="hero home-container">
        <div className="hero-copy"><p className="eyebrow"><span>●</span> LifeStep · Step into real life</p><h1>{copy.title.split(" - ")[0]} <em>{copy.title.split(" - ")[1] || "Step into real life"}</em></h1><p className="hero-lead">{copy.intro}</p><div className="hero-actions"><Link className="button" href="/app">{copy.getStarted}<ArrowRight /></Link><a className="text-link" href="#how"><Play />{copy.explore}</a></div><div className="hero-proof"><span><BadgeCheck />{copy.features[1].tags[0]}</span><span><Volume2 />{copy.features[2].tags[0]}</span><span><Sparkles />{copy.features[4].tags[1]}</span></div></div>
        <div className="hero-visual" aria-label="LifeStep journey preview"><div className="hero-sun" /><span className="hero-cloud cloud-one" /><span className="hero-cloud cloud-two" /><div className="hero-map-card"><div className="mini-map-head"><span>{copy.features[0].eyebrow.replace(/^\d+\s*\/\s*/, "")}</span><strong>3 / 12</strong></div><div className="mini-route"><span className="mini-line" /><div className="mini-stop done"><span>🛬</span><b>Arrive</b></div><div className="mini-stop current"><span>🏠</span><b>Find a home</b><i>You are here</i></div><div className="mini-stop"><span>🏦</span><b>Finances</b></div><div className="mini-stop"><span>🚇</span><b>Get around</b></div></div></div><div className="phrase-card"><MessageCircle /><div><small>Try saying</small><strong>Could you repeat that?</strong><span>可以请您再说一遍吗？</span></div><button aria-label="Play phrase"><Volume2 /></button></div></div>
      </section>

      <section className="home-metrics home-container" aria-label="LifeStep at a glance">{copy.metrics.map((metric) => <article key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></article>)}</section>

      <section className="section home-container" id="how"><div className="section-heading"><p className="eyebrow">LifeStep</p><h2>{copy.featuresKicker}</h2></div><div className="steps-grid home-feature-grid">{copy.features.map((feature, index) => <article key={feature.title}><span className="step-number">{String(index + 1).padStart(2, "0")}</span>{index % 3 === 0 ? <Map /> : index % 3 === 1 ? <BookOpen /> : <MessageCircle />}<small>{feature.eyebrow.replace(/^\d+\s*\/\s*/, "")}</small><h3>{feature.title}</h3><p>{feature.body}</p><div className="home-feature-tags">{feature.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>)}</div></section>

      <section className="section journey-showcase"><div className="home-container"><div className="section-heading split"><div><p className="eyebrow">LifeStep Journey</p><h2>{copy.features[0].title}</h2></div><p>{copy.features[0].body}</p></div><div className="stage-marquee">{stages.map(([icon, label], index) => <article key={label} className={index < 3 ? "active" : ""}><span>{icon}</span><small>Stage {String(index + 1).padStart(2, "0")}</small><strong>{label}</strong><ChevronRight /></article>)}</div><Link className="journey-link" href="/app">{copy.launchApp}<ArrowRight /></Link></div></section>

      <section className="section home-container conversation-showcase"><div className="phone-chat"><div className="phone-bar"><span>Immigration inspection</span><small>Practice mode</small></div><div className="chat-date">Today · Pearson Airport</div><div className="chat-bubble partner"><small>Officer</small>What is the purpose of your visit?<span>您此次来访的目的是什么？</span><button><Volume2 /></button></div><div className="chat-bubble self"><small>You</small>I&apos;m here to study at a college in Toronto.<span>我来多伦多的一所学院学习。</span><button><Volume2 /></button></div><div className="practice-prompt"><span>2 / 6</span><strong>Your turn</strong><p>Tap the sentence to hear it, then say it out loud.</p><button className="button">Play my line <Volume2 /></button></div></div><div className="conversation-copy"><p className="eyebrow">{copy.features[2].eyebrow.replace(/^\d+\s*\/\s*/, "")}</p><h2>{copy.features[2].title}</h2><p>{copy.features[2].body}</p><ul>{copy.features[2].tags.map((tag) => <li key={tag}><BadgeCheck />{tag}</li>)}</ul><Link href="/app" className="text-link">{copy.getStarted}<ArrowRight /></Link></div></section>

      <section className="section home-container home-faq-section" id="faq"><div className="section-heading"><p className="eyebrow">LifeStep</p><h2>{copy.faqNav}</h2></div><HomeFaq items={copy.faq} /></section>

      <footer className="home-footer home-container"><div className="home-footer-brand"><Image src="/logo.svg" alt="" width={40} height={40} /><div><strong>LifeStep</strong><span>{copy.footer}</span></div></div><div className="home-footer-meta"><nav><Link href="/app/about?panel=app">{dictionary.profile.menu.aboutApp}</Link><Link href="/app/about?panel=privacy">{copy.privacyNav}</Link><Link href="/app/about?panel=terms">{copy.termsNav}</Link><Link href="/app/about?panel=feedback">{dictionary.profile.menu.feedback}</Link></nav><span>© 2026 EffortGo · {process.env.APP_VERSION}</span></div></footer>
    </main>
  </>;
}

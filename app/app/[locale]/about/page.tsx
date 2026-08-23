"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Dot, FileText, Info, LoaderCircle, MessageSquareText, ShieldCheck, X } from "lucide-react";
import { Suspense } from "react";
import { AppBackHeader as BackHeader, AppSectionTitle } from "@/components/app";
import { useApp } from "@/components/providers/app-provider";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";
import { Button } from "@/components/ui/button";
import { isValidEmail, normalizeEmail, submitFeedback } from "@/lib/api/common";
import { lifeStepAbout } from "@/messages/lifestep";
import { subPageClass } from "@/components/app/app-ui-styles";
import { cn } from "@/lib/utils";

type AboutPanel = "privacy" | "terms" | "app" | "feedback";
type FeedbackType = "bug" | "suggestion" | "other";

const FEEDBACK_MAX_LENGTH = 1000;

export default function AboutPage() {
  return <Suspense fallback={null}><AboutContent /></Suspense>;
}

function AboutContent() {
  const params = useSearchParams();
  const { dictionary, copy, locale } = useApp();
  const panel = (params.get("panel") || "app") as AboutPanel;
  if (panel === "feedback") return <FeedbackPanel />;

  const page = panel === "privacy" ? dictionary.privacyPolicy : panel === "terms" ? dictionary.termsPage : dictionary.aboutAppPage;
  const icon = panel === "privacy" ? <ShieldCheck /> : panel === "terms" ? <FileText /> : <Info />;
  const sections = panel === "app"
    ? (lifeStepAbout[locale] || lifeStepAbout.en).sections
    : [[page.s1Title, page.s1Body], [page.s2Title, page.s2Body], [page.s3Title, page.s3Body], [page.s4Title, page.s4Body]];

  return <main className={subPageClass}>
    <BackHeader title={page.title} eyebrow={copy.about} />
    <article className="app-narrow-width py-[42px] max-[680px]:py-7">
      <AppSectionTitle icon={icon} title={page.title} />
      <div className="grid gap-4">
        {sections.map(([title, body]) => <section className="border-0 p-0" key={title}><h2 className="m-0 text-lg font-semibold leading-7">{title}</h2><p className="mb-0 mt-2 text-base leading-6 text-muted-foreground">{body}</p></section>)}
      </div>
      {panel === "app" ? <footer className="mt-8 pb-4 text-center text-sm text-muted-foreground"><span className="inline-flex items-center">© 2026 EffortGo <Dot aria-hidden="true" className="size-4" /> {process.env.APP_VERSION}</span></footer> : null}
    </article>
  </main>;
}

function FeedbackPanel() {
  const { dictionary, copy } = useApp();
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const isEmailValid = normalizedEmail.length === 0 || isValidEmail(normalizedEmail);
  const submitDisabled = submitting || !isEmailValid || !content.trim();

  function validateEmail(value: string) {
    return value && !isValidEmail(value) ? dictionary.auth.emailError : undefined;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validateEmail(email);
    setEmailError(nextError);
    if (nextError || submitDisabled) return;
    setSubmitting(true);
    try {
      const response = await submitFeedback(normalizedEmail, type, content.trim());
      if (response.code !== 200) return;
      setEmail("");
      setContent("");
      setType("suggestion");
      setEmailError(undefined);
      showGlobalSnackbar(dictionary.feedbackPage.submitSuccess);
    } catch {
      showGlobalSnackbar(dictionary.network.requestFailed);
    } finally {
      setSubmitting(false);
    }
  }

  const title = dictionary.feedbackPage.title;
  return <main className={subPageClass}>
    <BackHeader title={title} eyebrow={copy.about} />
    <article className="app-narrow-width py-[42px] max-[680px]:py-7">
      <AppSectionTitle icon={<MessageSquareText />} title={title} />
      <form noValidate className="grid gap-3" onSubmit={submit}>
        <div>
          <div className="relative">
            <input className="h-11 w-full rounded-[var(--radius)] border border-input bg-card py-0 pl-3 pr-11 text-foreground outline-none transition focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_22%,transparent)] aria-invalid:border-destructive" value={email} disabled={submitting} type="email" autoComplete="email username" inputMode="email" aria-invalid={Boolean(emailError)} placeholder={dictionary.feedbackPage.emailOptional} onChange={(event) => { setEmail(event.target.value); setEmailError(validateEmail(event.target.value)); }} />
            {email && !submitting ? <button className="absolute right-1 top-1.5 grid size-8 cursor-pointer place-items-center rounded-[var(--radius)] bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground [&_svg]:size-4" type="button" aria-label="Clear" onClick={() => { setEmail(""); setEmailError(undefined); }}><X /></button> : null}
          </div>
          <p className="m-0 min-h-5 pt-1 text-xs text-destructive">{emailError}</p>
        </div>
        <div>
          <textarea className="min-h-48 w-full resize-y rounded-[var(--radius)] border border-input bg-card px-3 py-2 text-base text-foreground outline-none transition focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_22%,transparent)]" value={content} disabled={submitting} maxLength={FEEDBACK_MAX_LENGTH} placeholder={dictionary.feedbackPage.content} onChange={(event) => setContent(event.target.value.slice(0, FEEDBACK_MAX_LENGTH))} />
          <div className="min-h-5 pt-1 text-right text-xs text-muted-foreground">{content.length}/{FEEDBACK_MAX_LENGTH}</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([[
            "bug", dictionary.feedbackPage.typeBug,
          ], ["suggestion", dictionary.feedbackPage.typeSuggestion], ["other", dictionary.feedbackPage.typeOther]] as Array<[FeedbackType, string]>).map(([value, label]) => <button type="button" key={value} disabled={submitting} className={cn("h-10 cursor-pointer rounded-[var(--radius)] border border-border bg-transparent text-sm font-medium text-muted-foreground", type === value && "border-primary text-primary")} onClick={() => setType(value)}>{label}</button>)}
        </div>
        <Button type="submit" className="w-full" disabled={submitDisabled}>{dictionary.feedbackPage.submit}</Button>
      </form>
    </article>
    {submitting ? <div className="fixed inset-0 z-120 grid place-items-center bg-black/20 backdrop-blur-[2px] [&_svg]:size-[38px] [&_svg]:animate-spin [&_svg]:text-white"><LoaderCircle /></div> : null}
  </main>;
}

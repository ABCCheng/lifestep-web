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

  return <main className="app-page sub-page">
    <BackHeader title={page.title} eyebrow={copy.about} />
    <article className="simple-content app-narrow-width">
      <AppSectionTitle icon={icon} title={page.title} />
      <div className="about-section-list">
        {sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
      </div>
      {panel === "app" ? <footer className="about-version"><span className="inline-flex items-center">© 2026 EffortGo <Dot aria-hidden="true" className="size-4" /> {process.env.APP_VERSION}</span></footer> : null}
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
  return <main className="app-page sub-page">
    <BackHeader title={title} eyebrow={copy.about} />
    <article className="simple-content app-narrow-width">
      <AppSectionTitle icon={<MessageSquareText />} title={title} />
      <form noValidate className="flash-feedback-form" onSubmit={submit}>
        <div>
          <div className="feedback-email-field">
            <input value={email} disabled={submitting} type="email" autoComplete="email username" inputMode="email" aria-invalid={Boolean(emailError)} placeholder={dictionary.feedbackPage.emailOptional} onChange={(event) => { setEmail(event.target.value); setEmailError(validateEmail(event.target.value)); }} />
            {email && !submitting ? <button type="button" aria-label="Clear" onClick={() => { setEmail(""); setEmailError(undefined); }}><X /></button> : null}
          </div>
          <p className="feedback-error">{emailError}</p>
        </div>
        <div>
          <textarea value={content} disabled={submitting} maxLength={FEEDBACK_MAX_LENGTH} placeholder={dictionary.feedbackPage.content} onChange={(event) => setContent(event.target.value.slice(0, FEEDBACK_MAX_LENGTH))} />
          <div className="feedback-counter">{content.length}/{FEEDBACK_MAX_LENGTH}</div>
        </div>
        <div className="feedback-type-grid">
          {([[
            "bug", dictionary.feedbackPage.typeBug,
          ], ["suggestion", dictionary.feedbackPage.typeSuggestion], ["other", dictionary.feedbackPage.typeOther]] as Array<[FeedbackType, string]>).map(([value, label]) => <button type="button" key={value} disabled={submitting} className={type === value ? "active" : ""} onClick={() => setType(value)}>{label}</button>)}
        </div>
        <Button type="submit" className="w-full" disabled={submitDisabled}>{dictionary.feedbackPage.submit}</Button>
      </form>
    </article>
    {submitting ? <div className="web-push-saving"><LoaderCircle className="spin" /></div> : null}
  </main>;
}

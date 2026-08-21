"use client";

import { FileText, Info, MessageSquareText, Send, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { AppBackHeader as BackHeader } from "@/components/app";

const panels = {
  app: { title: "About LifeStep", icon: <Info />, sections: [["A confident first step", "LifeStep helps Canadian newcomers prepare for real-life situations through interactive English conversations. It turns unfamiliar moments into clear, friendly practice."], ["Built around your life", "Your journey follows the practical stages of arriving, settling, finding a home, working, supporting a family, and joining your community."], ["Practice, not perfection", "Learn the context, build useful vocabulary, listen to natural dialogue, and practise one line at a time. Confidence comes from familiar moments."], ["Made in Canada", "LifeStep is an EffortGo project created for the everyday reality of building a new life in Canada."]] },
  privacy: { title: "Privacy", icon: <ShieldCheck />, sections: [["Your device, your progress", "Your selected journey, theme, language, and voice preferences are stored on this device. A device cookie connects scenario progress to the service."], ["What we collect", "LifeStep only sends the information needed to activate your device, load learning content, and save your progress."], ["Your control", "You can clear local preferences and browser data at any time from your browser settings."]] },
  terms: { title: "Terms of Use", icon: <FileText />, sections: [["Learning support", "LifeStep provides language practice and general settlement context. It is not legal, immigration, medical, or financial advice."], ["Responsible use", "Use the service for personal learning and do not attempt to disrupt or misuse its content or systems."], ["Availability", "Features may evolve as we improve the learning experience. We aim to keep your progress available but cannot guarantee uninterrupted service."]] },
} as const;

export default function AboutPage() { return <Suspense fallback={null}><AboutContent /></Suspense>; }

function AboutContent() {
  const params = useSearchParams();
  const panel = params.get("panel") || "app";
  if (panel === "feedback") return <Feedback />;
  const content = panels[panel as keyof typeof panels] || panels.app;
  return <main className="app-page sub-page"><BackHeader title={content.title} eyebrow="About" /><article className="simple-content app-narrow-width"><header className="simple-hero"><span>{content.icon}</span><p className="app-eyebrow">LifeStep</p><h2>{content.title}</h2></header>{content.sections.map(([title, body]) => <section key={title}><h3>{title}</h3><p>{body}</p></section>)}<footer>© 2026 EffortGo · LifeStep v1.0.0</footer></article></main>;
}

function Feedback() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  return <main className="app-page sub-page"><BackHeader title="Feedback" eyebrow="About" /><article className="simple-content app-narrow-width"><header className="simple-hero"><span><MessageSquareText /></span><p className="app-eyebrow">Help us improve</p><h2>Tell us what would make your next step easier.</h2></header>{sent ? <div className="success-note"><Send /><strong>Thank you.</strong><p>Your feedback is ready to help shape LifeStep.</p></div> : <form className="feedback-form" onSubmit={submit}><label>Email <small>optional</small><input type="email" placeholder="you@example.com" /></label><label>What&apos;s on your mind?<textarea required maxLength={1000} placeholder="Share an idea, report a problem, or tell us about a conversation you need…" /></label><button className="button" type="submit">Send feedback <Send /></button></form>}</article></main>;
}

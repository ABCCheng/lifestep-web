"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, GraduationCap, Lightbulb, ListChecks, LoaderCircle, MessageCircle, Sparkles, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppBackHeader as BackHeader } from "@/components/app";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { lifeStepApi } from "@/lib/api";
import { mockScenarioDetail } from "@/lib/content";
import type { ScenarioDetail } from "@/lib/types";
import { DEFAULT_TTS_SETTINGS, type TTSVoice } from "@/lib/stores/tts";
import { playEdgeTTS } from "@/lib/tts/playback";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";

type Step = "knowledge" | "vocabulary" | "conversation" | "review";
const steps: Array<{ key: Step; title: string; icon: React.ReactNode }> = [
  { key: "knowledge", title: "Knowledge", icon: <Lightbulb /> },
  { key: "vocabulary", title: "Vocabulary", icon: <BookOpen /> },
  { key: "conversation", title: "Conversation", icon: <MessageCircle /> },
  { key: "review", title: "Review", icon: <ListChecks /> },
];

export default function ScenarioPage() {
  return <Suspense fallback={<div className="page-loader"><LoaderCircle /></div>}><ScenarioContent /></Suspense>;
}

function ScenarioContent() {
  const params = useSearchParams();
  const { locale, copy, voices } = useApp();
  const id = Number(params.get("id") || 1);
  const title = params.get("title") || "Immigration Inspection";
  const langTitle = params.get("langTitle") || "入境检查";
  const [activeStep, setActiveStep] = useState<Step>("knowledge");
  const [detail, setDetail] = useState<ScenarioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    lifeStepApi.scenarioDetail(id)
      .then((data) => active && setDetail(data))
      .catch(() => { if (active) { setDetail(mockScenarioDetail(id)); setPreview(true); } })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const currentIndex = steps.findIndex((step) => step.key === activeStep);
  function navigateStep(direction: number) {
    const next = steps[Math.max(0, Math.min(steps.length - 1, currentIndex + direction))];
    if (next) setActiveStep(next.key);
  }

  async function finish() {
    await lifeStepApi.completeScenario(id).catch(() => undefined);
    setComplete(true);
  }

  const nextId = params.get("nextId");
  const nextQuery = nextId ? new URLSearchParams({ id: nextId, stage: params.get("stage") || "ARRIVE", journey: params.get("journey") || "STUDY", title: params.get("nextTitle") || "Next scenario", langTitle: params.get("nextLangTitle") || "下一个场景" }) : null;

  return (
    <main className="app-page sub-page scenario-page">
      <BackHeader title={steps[currentIndex].title} eyebrow={`${title}${locale === "en" ? "" : ` · ${langTitle}`}`} />
      <nav className="learning-progress app-content-width" aria-label="Scenario sections">
        {steps.map((step, index) => <button key={step.key} className={activeStep === step.key ? "active" : index < currentIndex ? "visited" : ""} onClick={() => setActiveStep(step.key)}><span>{index < currentIndex ? <Check /> : step.icon}</span><small>{step.title}</small></button>)}
      </nav>
      {preview ? <div className="connection-note app-content-width">{copy.offline}</div> : null}

      <section className="learning-content app-content-width">
        {loading || !detail ? <div className="page-loader"><LoaderCircle /><span>{copy.loading}</span></div> : (
          <>
            {activeStep === "knowledge" ? <Knowledge detail={detail} /> : null}
            {activeStep === "vocabulary" ? <Vocabulary detail={detail} onSpeak={(text) => speak(text, voices.partner)} /> : null}
            {activeStep === "conversation" ? <Conversation detail={detail} partnerVoice={voices.partner} selfVoice={voices.self} /> : null}
            {activeStep === "review" ? <Review detail={detail} onFinish={finish} voice={voices.partner} /> : null}
          </>
        )}
      </section>

      {!loading ? <footer className="step-footer app-content-width">
        <button className="button button-secondary" disabled={currentIndex === 0} onClick={() => navigateStep(-1)}><ArrowLeft /> Previous</button>
        {activeStep !== "review" ? <button className="button" onClick={() => navigateStep(1)}>Next: {steps[currentIndex + 1]?.title}<ArrowRight /></button> : null}
      </footer> : null}

      {complete ? (
        <Modal onClose={() => setComplete(false)} labelledBy="complete-title">
          <div className="complete-modal">
            <div className="confetti">✦ <span>●</span> ✦ <i>●</i> ✦</div>
            <span className="complete-icon"><CheckCircle2 /></span>
            <p className="app-eyebrow">Scenario complete</p>
            <h2 id="complete-title">You did it!</h2>
            <h3>又迈出了重要的一步</h3>
            <p>You&apos;re ready to use this conversation in real life. Keep the momentum going.</p>
            {nextQuery ? <Link className="button" href={`/app/scenario?${nextQuery.toString()}`}>Continue to next scenario <ArrowRight /></Link> : <Link className="button" href={`/app/stage?stage=${params.get("stage") || "ARRIVE"}&journey=${params.get("journey") || "STUDY"}`}>Choose the next scenario <ArrowRight /></Link>}
            <Link className="text-link" href="/app">Return to journey</Link>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function Knowledge({ detail }: { detail: ScenarioDetail }) {
  return <div className="knowledge-view"><header className="content-title"><span><Lightbulb /></span><div><p className="app-eyebrow">Know before you go</p><h2>Set yourself up for a good conversation.</h2></div></header><div className="knowledge-grid">{detail.knowledgeList.map((item, index) => <article key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><h4>{item.langTitle}</h4><p>{item.content}</p><p className="translated">{item.langContent}</p></article>)}</div><aside className="tip-card"><Sparkles /><div><strong>LifeStep tip</strong><p>You don&apos;t have to understand every word. Listen for the key question, then answer one idea at a time.</p></div></aside></div>;
}

function Vocabulary({ detail, onSpeak }: { detail: ScenarioDetail; onSpeak: (text: string) => void }) {
  return <div className="vocabulary-view"><header className="content-title"><span><BookOpen /></span><div><p className="app-eyebrow">Words for the moment</p><h2>Tap, listen, and make them yours.</h2></div></header><div className="vocab-list">{detail.vocabularyList.map((item, index) => <button key={item.id} onClick={() => onSpeak(item.term)}><span className="vocab-number">{index + 1}</span><span className="vocab-copy"><strong>{item.term}</strong><em>{item.langTerm}</em><small>{item.pronunciation}</small></span><span className="vocab-play"><Volume2 /></span></button>)}</div></div>;
}

function Conversation({ detail, partnerVoice, selfVoice }: { detail: ScenarioDetail; partnerVoice: TTSVoice; selfVoice: TTSVoice }) {
  const [mode, setMode] = useState<"full" | "practice">("full");
  const [line, setLine] = useState(0);
  const conversation = detail.conversationList;
  const shown = mode === "full" ? conversation : conversation.slice(line, line + 1);

  return <div className="conversation-view"><header className="conversation-toolbar"><div><p className="app-eyebrow">Conversation practice</p><h2>Make the moment feel familiar.</h2></div><div className="mode-switch"><button className={mode === "full" ? "active" : ""} onClick={() => setMode("full")}>Full dialogue</button><button className={mode === "practice" ? "active" : ""} onClick={() => setMode("practice")}>Practice mode</button></div></header><div className={`conversation-phone ${mode}`}><div className="conversation-phone-head"><div className="partner-avatar">LS</div><div><strong>Conversation partner</strong><small>Tap a message to listen</small></div><span className="online-dot" /></div><div className="conversation-messages"><p className="chat-date">Real-life practice · Canada</p>{shown.map((item) => { const self = /YOU|USER|SELF|ME/i.test(item.speaker); return <button className={`message-row ${self ? "self" : "partner"}`} key={item.id} onClick={() => speak(item.message, self ? selfVoice : partnerVoice)}><span className="message-speaker">{self ? "You" : friendlySpeaker(item.speaker)}</span><span className="message-bubble"><strong>{item.message}</strong><em>{item.langMessage}</em><small><Volume2 /> Tap to listen</small></span></button>; })}</div>{mode === "practice" ? <div className="practice-controls"><div><span>Line {line + 1} of {conversation.length}</span><div className="practice-dots">{conversation.map((item, index) => <i key={item.id} className={index === line ? "active" : index < line ? "done" : ""} />)}</div></div><div><button aria-label="Previous line" disabled={line === 0} onClick={() => setLine((value) => value - 1)}><ChevronLeft /></button><button className="practice-play" onClick={() => speak(conversation[line].message, /YOU|USER|SELF|ME/i.test(conversation[line].speaker) ? selfVoice : partnerVoice)}><Volume2 /> Play line</button><button aria-label="Next line" disabled={line === conversation.length - 1} onClick={() => setLine((value) => value + 1)}><ChevronRight /></button></div></div> : null}</div></div>;
}

function Review({ detail, onFinish, voice }: { detail: ScenarioDetail; onFinish: () => void; voice: TTSVoice }) {
  const [checked, setChecked] = useState<string[]>([]);
  const [finishing, setFinishing] = useState(false);
  const phrases = detail.review.keyPhrases;
  async function finish() { setFinishing(true); await onFinish(); setFinishing(false); }
  return <div className="review-view"><header className="content-title"><span><GraduationCap /></span><div><p className="app-eyebrow">Ready for real life?</p><h2>One last look before you go.</h2></div></header><article className="review-summary"><small>What you practised</small><p>{detail.review.summary}</p></article><section className="phrase-checklist"><h3>Tap each phrase when you can say it confidently.</h3>{phrases.map((phrase) => <button key={phrase} className={checked.includes(phrase) ? "checked" : ""} onClick={() => setChecked((value) => value.includes(phrase) ? value.filter((item) => item !== phrase) : [...value, phrase])}><span>{checked.includes(phrase) ? <Check /> : <Circle />}</span><strong>{phrase}</strong><Volume2 onClick={(event) => { event.stopPropagation(); speak(phrase, voice); }} /></button>)}</section><aside className="takeaway"><Sparkles /><div><small>Take this with you</small><p>{detail.review.takeaway}</p></div></aside><button className="button complete-button" disabled={finishing} onClick={finish}>{finishing ? <LoaderCircle className="spin" /> : <CheckCircle2 />} Complete this scenario</button></div>;
}

function friendlySpeaker(speaker: string) {
  return speaker.toLowerCase().replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function speak(text: string, preferredVoice: TTSVoice = DEFAULT_TTS_SETTINGS.partner) {
  void playEdgeTTS(text, preferredVoice).catch((error) => {
    if ((error as DOMException)?.name !== "AbortError") showGlobalSnackbar("Couldn't play audio");
  });
}

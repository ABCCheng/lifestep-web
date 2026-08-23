"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, GraduationCap, Lightbulb, ListChecks, LoaderCircle, MessageCircle, Sparkles, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppBackHeader as BackHeader } from "@/components/app";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { lifeStepApi } from "@/lib/api";
import { localizePath } from "@/lib/i18n";
import { mockScenarioDetail } from "@/lib/content";
import type { ScenarioDetail } from "@/lib/types";
import { DEFAULT_TTS_SETTINGS, type TTSVoice } from "@/lib/stores/tts";
import { playEdgeTTS } from "@/lib/tts/playback";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";
import { appEyebrowClass, connectionNoteClass, pageLoaderClass, primaryActionClass, secondaryActionClass, subPageClass, textLinkClass, translatedClass } from "@/components/app/app-ui-styles";
import { cn } from "@/lib/utils";
import { contentTitleClass, conversationPhoneClass, learningProgressClass, learningStepClass, messageBubbleClass, reviewPhraseClass } from "./styles";

type Step = "knowledge" | "vocabulary" | "conversation" | "review";
const steps: Array<{ key: Step; title: string; icon: React.ReactNode }> = [
  { key: "knowledge", title: "Knowledge", icon: <Lightbulb /> },
  { key: "vocabulary", title: "Vocabulary", icon: <BookOpen /> },
  { key: "conversation", title: "Conversation", icon: <MessageCircle /> },
  { key: "review", title: "Review", icon: <ListChecks /> },
];

export default function ScenarioPage() {
  return <Suspense fallback={<div className={pageLoaderClass}><LoaderCircle /></div>}><ScenarioContent /></Suspense>;
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
    <main className={subPageClass}>
      <BackHeader title={steps[currentIndex].title} eyebrow={`${title}${locale === "en" ? "" : ` · ${langTitle}`}`} />
      <nav className={learningProgressClass} aria-label="Scenario sections">
        {steps.map((step, index) => <button key={step.key} className={cn(learningStepClass, (activeStep === step.key || index < currentIndex) && "text-primary", activeStep === step.key && "[&>span]:border-primary [&>span]:bg-primary [&>span]:text-white [&>span]:shadow-[0_0_0_5px_color-mix(in_srgb,var(--primary)_9%,transparent)]", index < currentIndex && "[&>span]:border-[#26734d] [&>span]:bg-[#26734d] [&>span]:text-white")} onClick={() => setActiveStep(step.key)}><span>{index < currentIndex ? <Check /> : step.icon}</span><small>{step.title}</small></button>)}
      </nav>
      {preview ? <div className={cn("app-content-width", connectionNoteClass)}>{copy.offline}</div> : null}

      <section className="app-content-width min-h-[510px] pb-5 pt-[35px] max-[680px]:pt-6">
        {loading || !detail ? <div className={pageLoaderClass}><LoaderCircle /><span>{copy.loading}</span></div> : (
          <>
            {activeStep === "knowledge" ? <Knowledge detail={detail} /> : null}
            {activeStep === "vocabulary" ? <Vocabulary detail={detail} onSpeak={(text) => speak(text, voices.partner)} /> : null}
            {activeStep === "conversation" ? <Conversation detail={detail} partnerVoice={voices.partner} selfVoice={voices.self} /> : null}
            {activeStep === "review" ? <Review detail={detail} onFinish={finish} voice={voices.partner} /> : null}
          </>
        )}
      </section>

      {!loading ? <footer className="app-content-width flex justify-between gap-3 border-t border-border pb-10 pt-5 max-[680px]:[&_button]:min-w-0 max-[680px]:[&_button]:flex-1 max-[680px]:[&_button]:px-3 max-[680px]:[&_button]:text-xs">
        <button className={secondaryActionClass} disabled={currentIndex === 0} onClick={() => navigateStep(-1)}><ArrowLeft /> Previous</button>
        {activeStep !== "review" ? <button className={primaryActionClass} onClick={() => navigateStep(1)}>Next: {steps[currentIndex + 1]?.title}<ArrowRight /></button> : null}
      </footer> : null}

      {complete ? (
        <Modal onClose={() => setComplete(false)} labelledBy="complete-title">
          <div className="text-center">
            <div className="h-5 tracking-[16px] text-primary">✦ <span className="text-[#d69d2c]">●</span> ✦ <i className="text-[#26734d]">●</i> ✦</div>
            <span className="mx-auto mb-5 mt-1 grid size-[82px] place-items-center rounded-full bg-[#26734d]/10 text-[#26734d] [&_svg]:size-10"><CheckCircle2 /></span>
            <p className={appEyebrowClass}>Scenario complete</p>
            <h2 className="mt-1.5 text-[2.7rem] tracking-[-0.065em] max-[680px]:text-[2.3rem]" id="complete-title">You did it!</h2>
            <h3 className="my-1 text-primary">又迈出了重要的一步</h3>
            <p className="mx-auto mb-[22px] mt-3.5 leading-6 text-muted-foreground">You&apos;re ready to use this conversation in real life. Keep the momentum going.</p>
            {nextQuery ? <Link className={cn(primaryActionClass, "w-full")} href={`${localizePath("/scenario", locale)}?${nextQuery.toString()}`}>Continue to next scenario <ArrowRight /></Link> : <Link className={cn(primaryActionClass, "w-full")} href={`${localizePath("/stage", locale)}?stage=${params.get("stage") || "ARRIVE"}&journey=${params.get("journey") || "STUDY"}`}>Choose the next scenario <ArrowRight /></Link>}
            <Link className={cn(textLinkClass, "mt-[18px] text-[0.8rem] text-muted-foreground")} href={localizePath("/", locale)}>Return to journey</Link>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function Knowledge({ detail }: { detail: ScenarioDetail }) {
  return <div><header className={contentTitleClass}><span><Lightbulb /></span><div><p className={appEyebrowClass}>Know before you go</p><h2>Set yourself up for a good conversation.</h2></div></header><div className="grid grid-cols-2 gap-3.5 max-[680px]:grid-cols-1">{detail.knowledgeList.map((item, index) => <article className="relative rounded-[20px] border border-border bg-card p-[26px] max-[680px]:p-[21px]" key={item.id}><span className="absolute right-[18px] top-3.5 text-[2rem] font-black text-primary/20">{String(index + 1).padStart(2, "0")}</span><h3 className="m-0 text-[1.1rem]">{item.title}</h3><h4 className="mb-[17px] mt-1 text-[0.82rem] text-primary">{item.langTitle}</h4><p className="leading-relaxed text-muted-foreground">{item.content}</p><p className={cn("leading-relaxed", translatedClass)}>{item.langContent}</p></article>)}</div><aside className="mt-[15px] flex items-start gap-3.5 rounded-[17px] bg-[#26734d]/10 p-5 text-[#26734d] [&_p]:mb-0 [&_p]:mt-1 [&_p]:text-[0.86rem] [&_p]:leading-6 [&_p]:text-foreground"><Sparkles /><div><strong>LifeStep tip</strong><p>You don&apos;t have to understand every word. Listen for the key question, then answer one idea at a time.</p></div></aside></div>;
}

function Vocabulary({ detail, onSpeak }: { detail: ScenarioDetail; onSpeak: (text: string) => void }) {
  return <div><header className={contentTitleClass}><span><BookOpen /></span><div><p className={appEyebrowClass}>Words for the moment</p><h2>Tap, listen, and make them yours.</h2></div></header><div className="grid grid-cols-2 gap-3 max-[680px]:grid-cols-1">{detail.vocabularyList.map((item, index) => <button className="grid min-h-[110px] cursor-pointer grid-cols-[36px_1fr_42px] items-center gap-3 rounded-[17px] border border-border bg-card p-4 text-left hover:border-primary" key={item.id} onClick={() => onSpeak(item.term)}><span className="font-black text-primary/35">{index + 1}</span><span className="grid gap-1"><strong className="text-base">{item.term}</strong><em className="text-[0.78rem] not-italic text-primary">{item.langTerm}</em><small className="text-[0.69rem] text-muted-foreground">{item.pronunciation}</small></span><span className="grid size-[38px] place-items-center rounded-full bg-primary/10 text-primary"><Volume2 /></span></button>)}</div></div>;
}

function Conversation({ detail, partnerVoice, selfVoice }: { detail: ScenarioDetail; partnerVoice: TTSVoice; selfVoice: TTSVoice }) {
  const [mode, setMode] = useState<"full" | "practice">("full");
  const [line, setLine] = useState(0);
  const conversation = detail.conversationList;
  const shown = mode === "full" ? conversation : conversation.slice(line, line + 1);

  return <div><header className="mb-5 flex items-end justify-between gap-5 max-[680px]:grid"><div><p className={appEyebrowClass}>Conversation practice</p><h2 className="mb-0 mt-1 text-[1.85rem] tracking-[-0.05em] max-[680px]:text-[1.45rem]">Make the moment feel familiar.</h2></div><div className="flex rounded-xl bg-secondary p-1 max-[680px]:w-full"><button className={cn("cursor-pointer rounded-[9px] bg-transparent px-3 py-2 text-[0.68rem] font-bold text-muted-foreground max-[680px]:flex-1", mode === "full" && "bg-card text-primary shadow-sm")} onClick={() => setMode("full")}>Full dialogue</button><button className={cn("cursor-pointer rounded-[9px] bg-transparent px-3 py-2 text-[0.68rem] font-bold text-muted-foreground max-[680px]:flex-1", mode === "practice" && "bg-card text-primary shadow-sm")} onClick={() => setMode("practice")}>Practice mode</button></div></header><div className={cn(conversationPhoneClass, mode === "practice" && "[&_.conversation-messages]:min-h-[300px]")}><div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-white px-[18px] py-3.5"><div className="grid size-[38px] place-items-center rounded-full bg-primary text-[0.72rem] font-extrabold text-white">LS</div><div className="grid"><strong>Conversation partner</strong><small className="text-[0.62rem] text-[#7a847e]">Tap a message to listen</small></div><span className="size-2 rounded-full bg-[#38a169]" /></div><div className="conversation-messages grid min-h-[450px] content-center p-5 max-[680px]:min-h-[390px] max-[680px]:p-[13px]"><p className="mx-auto mb-5 mt-3 text-center text-[0.64rem] text-[#8a938d]">Real-life practice · Canada</p>{shown.map((item) => { const self = /YOU|USER|SELF|ME/i.test(item.speaker); return <button className={cn("my-2 grid cursor-pointer justify-items-start bg-transparent text-left", self && "justify-items-end")} key={item.id} onClick={() => speak(item.message, self ? selfVoice : partnerVoice)}><span className="mx-2 mb-1 text-[0.58rem] font-extrabold uppercase text-[#6f7872]">{self ? "You" : friendlySpeaker(item.speaker)}</span><span className={cn(messageBubbleClass, self && "rounded-bl-2xl rounded-br-2xl rounded-tl-2xl rounded-tr-[5px] bg-[#d9f3e3]", mode === "practice" && "max-w-[min(90%,520px)] p-[22px] max-[680px]:max-w-[96%] [&_strong]:text-[1.1rem]")}><strong>{item.message}</strong><em>{item.langMessage}</em><small><Volume2 /> Tap to listen</small></span></button>; })}</div>{mode === "practice" ? <div className="border-t border-[#1d24201a] bg-white p-4"><div className="mb-3 flex items-center justify-between text-[0.65rem] text-[#68736d]"><span>Line {line + 1} of {conversation.length}</span><div className="flex gap-1">{conversation.map((item, index) => <i key={item.id} className={cn("h-[3px] w-4 rounded-full bg-[#d7ddd8]", index === line && "bg-primary", index < line && "bg-[#26734d]")} />)}</div></div><div className="grid grid-cols-[40px_1fr_40px] gap-2 [&_button]:flex [&_button]:min-h-10 [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:gap-2 [&_button]:rounded-[10px] [&_button]:bg-[#edf0ed] [&_button]:disabled:opacity-35"><button aria-label="Previous line" disabled={line === 0} onClick={() => setLine((value) => value - 1)}><ChevronLeft /></button><button className="bg-primary! text-[0.78rem] font-bold text-white" onClick={() => speak(conversation[line].message, /YOU|USER|SELF|ME/i.test(conversation[line].speaker) ? selfVoice : partnerVoice)}><Volume2 /> Play line</button><button aria-label="Next line" disabled={line === conversation.length - 1} onClick={() => setLine((value) => value + 1)}><ChevronRight /></button></div></div> : null}</div></div>;
}

function Review({ detail, onFinish, voice }: { detail: ScenarioDetail; onFinish: () => void; voice: TTSVoice }) {
  const [checked, setChecked] = useState<string[]>([]);
  const [finishing, setFinishing] = useState(false);
  const phrases = detail.review.keyPhrases;
  async function finish() { setFinishing(true); await onFinish(); setFinishing(false); }
  return <div><header className={contentTitleClass}><span><GraduationCap /></span><div><p className={appEyebrowClass}>Ready for real life?</p><h2>One last look before you go.</h2></div></header><article className="rounded-r-2xl border-l-4 border-primary bg-secondary p-6"><small className="text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-primary">What you practised</small><p className="mb-0 mt-2 leading-relaxed">{detail.review.summary}</p></article><section className="mt-[26px]"><h3 className="text-[0.95rem]">Tap each phrase when you can say it confidently.</h3>{phrases.map((phrase) => <button key={phrase} className={cn(reviewPhraseClass, checked.includes(phrase) && "border-[#26734d]/35 bg-[#26734d]/10 [&>span]:text-[#26734d]")} onClick={() => setChecked((value) => value.includes(phrase) ? value.filter((item) => item !== phrase) : [...value, phrase])}><span>{checked.includes(phrase) ? <Check /> : <Circle />}</span><strong>{phrase}</strong><Volume2 onClick={(event) => { event.stopPropagation(); speak(phrase, voice); }} /></button>)}</section><aside className="mt-[15px] flex items-start gap-3.5 rounded-[17px] bg-[#26734d]/10 p-5 text-[#26734d] [&_small]:text-[0.65rem] [&_small]:font-extrabold [&_small]:uppercase [&_small]:tracking-[0.08em] [&_small]:text-primary [&_p]:mb-0 [&_p]:mt-1 [&_p]:text-[0.86rem] [&_p]:leading-6 [&_p]:text-foreground"><Sparkles /><div><small>Take this with you</small><p>{detail.review.takeaway}</p></div></aside><button className={cn(primaryActionClass, "mt-[22px] w-full")} disabled={finishing} onClick={finish}>{finishing ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />} Complete this scenario</button></div>;
}

function friendlySpeaker(speaker: string) {
  return speaker.toLowerCase().replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function speak(text: string, preferredVoice: TTSVoice = DEFAULT_TTS_SETTINGS.partner) {
  void playEdgeTTS(text, preferredVoice).catch((error) => {
    if ((error as DOMException)?.name !== "AbortError") showGlobalSnackbar("Couldn't play audio");
  });
}

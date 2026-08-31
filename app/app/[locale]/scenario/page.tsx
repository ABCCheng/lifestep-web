"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, Lightbulb, ListChecks, LoaderCircle, MessageCircle, Sparkles, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppBackHeader as BackHeader } from "@/components/app";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { useLifeStepData } from "@/components/providers/lifestep-data-provider";
import { localizePath } from "@/lib/i18n";
import { mockScenarioDetail } from "@/lib/content";
import type { JourneyData, ScenarioDetail } from "@/lib/types";
import { DEFAULT_TTS_SETTINGS, type TTSVoice } from "@/lib/stores/tts";
import { playEdgeTTS } from "@/lib/tts/playback";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";
import { cn } from "@/lib/utils";

type Step = "knowledge" | "vocabulary" | "conversation" | "review";

const appEyebrowClass = "m-0 text-xs font-extrabold uppercase tracking-[0.1em] text-primary";
const connectionNoteClass = "my-3 rounded-xl border border-[#e4ba74] bg-[#fff7e6] px-3.5 py-2.5 text-[0.78rem] text-[#76521c] dark:bg-[#352a18] dark:text-[#e8c27f]";
const pageLoaderClass = "flex min-h-60 items-center justify-center gap-2.5 text-muted-foreground [&_svg]:animate-spin";
const primaryActionClass = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-primary bg-primary px-[22px] font-bold text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--primary)_18%,transparent)] transition duration-200 hover:-translate-y-px hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-45 disabled:transform-none [&_svg]:shrink-0";
const subPageClass = "app-page pb-10";
const textLinkClass = "inline-flex items-center gap-2 font-bold [&_svg]:text-primary";
const translatedClass = "text-[0.9em] text-muted-foreground!";

const learningProgressClass =
  "app-content-width sticky top-[var(--app-header-offset)] z-40 isolate flex items-center gap-[clamp(0.25rem,1vw,0.5rem)] px-1 py-2 pointer-events-none before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-1 before:w-screen before:-translate-x-1/2 before:content-[''] before:[background:var(--app-global-bg)] before:[background-position:center_calc(-1*var(--app-header-offset))] before:[background-repeat:no-repeat] before:[background-size:100vw_var(--app-fill-height)]";

const learningTrackClass =
  "relative grid min-w-0 flex-1 grid-cols-4 gap-1 before:absolute before:left-[12.5%] before:right-[12.5%] before:top-[clamp(1.0625rem,2vw,1.1875rem)] before:h-0.5 before:-translate-y-1/2 before:rounded-full before:bg-border/70 before:content-['']";

const learningTrackProgressClass =
  "pointer-events-none absolute left-[12.5%] top-[clamp(1.0625rem,2vw,1.1875rem)] h-0.5 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-300";

const learningNavActionClass =
  "pointer-events-auto grid size-[clamp(2.25rem,5vw,2.5rem)] shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-destructive/10 text-primary transition-colors hover:bg-destructive/20 hover:text-primary dark:bg-destructive/20 dark:hover:bg-destructive/30 disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-[clamp(1rem,2vw,1.125rem)]";

const learningStepClass =
  "relative z-1 grid min-w-0 cursor-pointer justify-items-center gap-[clamp(0.25rem,0.75vw,0.5rem)] rounded-xl bg-transparent px-[clamp(0.125rem,0.5vw,0.375rem)] py-0 text-muted-foreground transition-colors hover:text-foreground pointer-events-auto [&>span]:grid [&>span]:size-[clamp(2.125rem,4vw,2.375rem)] [&>span]:place-items-center [&>span]:rounded-full [&>span]:border-2 [&>span]:border-border [&>span]:bg-[var(--app-device-bg)] [&>small]:text-[clamp(0.55rem,1.1vw,0.69rem)] [&>small]:font-bold";

const conversationPhoneClass =
  "mx-auto max-w-[700px] overflow-hidden rounded-[22px] border border-border bg-[#e8ede9] text-[#1d2420] shadow-[var(--shadow)] max-[680px]:-mx-[3px] max-[680px]:rounded-[17px]";

const messageBubbleClass =
  "grid max-w-[76%] gap-1 rounded-bl-2xl rounded-br-2xl rounded-tl-[5px] rounded-tr-2xl bg-white px-3.5 py-3 shadow-[0_3px_10px_rgba(0,0,0,.05)] max-[680px]:max-w-[88%] [&_strong]:text-[0.9rem] [&_strong]:leading-[1.45] [&_em]:text-[0.72rem] [&_em]:not-italic [&_em]:text-[#657069] [&_small]:flex [&_small]:items-center [&_small]:gap-1 [&_small]:text-[0.58rem] [&_small]:text-primary";

const reviewPhraseClass =
  "mb-2 grid w-full cursor-pointer grid-cols-[34px_1fr_auto] items-center gap-2.5 rounded-[13px] border border-border bg-card p-3.5 text-left [&>span]:text-muted-foreground [&>svg]:text-primary";

export default function ScenarioPage() {
  return <Suspense fallback={<div className={pageLoaderClass}><LoaderCircle /></div>}><ScenarioContent /></Suspense>;
}

function ScenarioContent() {
  const params = useSearchParams();
  const { locale, copy, lifeStep, voices } = useApp();
  const steps: Array<{ key: Step; title: string; icon: React.ReactNode }> = [
    { key: "knowledge", title: lifeStep.scenario.knowledge, icon: <Lightbulb /> },
    { key: "vocabulary", title: lifeStep.scenario.vocabulary, icon: <BookOpen /> },
    { key: "conversation", title: lifeStep.scenario.conversation, icon: <MessageCircle /> },
    { key: "review", title: lifeStep.scenario.review, icon: <ListChecks /> },
  ];
  const journeyType = (params.get("journey") || "STUDY") as "STUDY" | "WORK" | "FAMILY";
  const { ensureJourneyData, getScenarioDetail, markScenarioCompleted } = useLifeStepData();
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
    ensureJourneyData(journeyType)
      .then((journeyData) => {
        const cachedDetail = getScenarioDetail(journeyType, id) || detailFromJourneyData(journeyData, id);
        if (cachedDetail) {
          if (active) setDetail(cachedDetail);
          return;
        }
        if (active) { setDetail(mockScenarioDetail(id)); setPreview(true); }
      })
      .catch(() => { if (active) { setDetail(mockScenarioDetail(id)); setPreview(true); } })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [ensureJourneyData, getScenarioDetail, id, journeyType]);

  const currentIndex = steps.findIndex((step) => step.key === activeStep);
  function navigateStep(direction: number) {
    const next = steps[Math.max(0, Math.min(steps.length - 1, currentIndex + direction))];
    if (next) setActiveStep(next.key);
  }

  async function finish() {
    markScenarioCompleted(journeyType, id);
    setComplete(true);
  }

  const nextId = params.get("nextId");
  const nextQuery = nextId ? new URLSearchParams({ id: nextId, stage: params.get("stage") || "ARRIVE", journey: params.get("journey") || "STUDY", title: params.get("nextTitle") || lifeStep.scenario.nextScenario, langTitle: params.get("nextLangTitle") || "" }) : null;

  return (
    <main className={subPageClass}>
      <BackHeader title={title} eyebrow={locale === "en" ? lifeStep.journey.scenario : langTitle || lifeStep.journey.scenario} />
      <nav className={learningProgressClass} aria-label={lifeStep.scenario.sections}>
        <button className={learningNavActionClass} aria-label={lifeStep.scenario.previous} disabled={currentIndex === 0} onClick={() => navigateStep(-1)}><ArrowLeft /></button>
        <div className={learningTrackClass}>
          <span className={learningTrackProgressClass} style={{ width: `${currentIndex * 25}%` }} aria-hidden="true" />
          {steps.map((step, index) => <button key={step.key} className={cn(learningStepClass, (activeStep === step.key || index < currentIndex) && "text-primary", activeStep === step.key && "[&>span]:border-primary [&>span]:bg-primary [&>span]:text-white [&>span]:shadow-[0_0_0_5px_color-mix(in_srgb,var(--primary)_9%,transparent)]", index < currentIndex && "[&>span]:border-[#26734d] [&>span]:bg-[#26734d] [&>span]:text-white")} onClick={() => setActiveStep(step.key)}><span>{index < currentIndex ? <Check /> : step.icon}</span><small>{step.title}</small></button>)}
        </div>
        <button className={learningNavActionClass} aria-label={lifeStep.scenario.next} disabled={activeStep === "review"} onClick={() => navigateStep(1)}><ArrowRight /></button>
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


      {complete ? (
        <Modal onClose={() => setComplete(false)} labelledBy="complete-title">
          <div className="text-center">
            <div className="h-5 tracking-[16px] text-primary">✦ <span className="text-[#d69d2c]">●</span> ✦ <i className="text-[#26734d]">●</i> ✦</div>
            <span className="mx-auto mb-5 mt-1 grid size-[82px] place-items-center rounded-full bg-[#26734d]/10 text-[#26734d] [&_svg]:size-10"><CheckCircle2 /></span>
            <p className={appEyebrowClass}>{lifeStep.scenario.complete}</p>
            <h2 className="mt-1.5 text-[2.7rem] tracking-[-0.065em] max-[680px]:text-[2.3rem]" id="complete-title">{lifeStep.scenario.youDidIt}</h2>
            <p className="mx-auto mb-[22px] mt-3.5 leading-6 text-muted-foreground">{lifeStep.scenario.completionBody}</p>
            {nextQuery ? <Link className={cn(primaryActionClass, "w-full")} href={`${localizePath("/scenario", locale)}?${nextQuery.toString()}`}>{lifeStep.scenario.continueNext} <ArrowRight /></Link> : <Link className={cn(primaryActionClass, "w-full")} href={`${localizePath("/stage", locale)}?stage=${params.get("stage") || "ARRIVE"}&journey=${params.get("journey") || "STUDY"}`}>{lifeStep.scenario.chooseNext} <ArrowRight /></Link>}
            <Link className={cn(textLinkClass, "mt-[18px] text-[0.8rem] text-muted-foreground")} href={localizePath("/", locale)}>{lifeStep.scenario.returnJourney}</Link>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function detailFromJourneyData(data: JourneyData | null, id: number): ScenarioDetail | null {
  const item = Object.values(data || {}).flat().find((scenario) => scenario.id === id);
  return item ? { scenarioId: item.id, knowledgeList: item.knowledgeList, vocabularyList: item.vocabularyList, conversationList: item.conversationList, review: item.review || { summary: "", keyPhrases: [], takeaway: "" } } : null;
}

function Knowledge({ detail }: { detail: ScenarioDetail }) {
  const { locale, lifeStep } = useApp();
  return <div><div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">{detail.knowledgeList.map((item, index) => <article className="relative rounded-[20px] border border-border bg-card p-[26px] max-[680px]:p-[21px]" key={item.id}><span className="absolute right-[18px] top-3.5 text-[2rem] font-black text-primary/20">{String(index + 1).padStart(2, "0")}</span><h3 className="m-0 text-[1.1rem]">{item.title}</h3>{locale !== "en" ? <h4 className="mb-[17px] mt-1 text-[0.82rem] text-primary">{item.langTitle}</h4> : null}<p className="leading-relaxed text-muted-foreground">{item.content}</p>{locale !== "en" ? <p className={cn("leading-relaxed", translatedClass)}>{item.langContent}</p> : null}</article>)}</div><aside className="mt-[15px] flex items-start gap-3.5 rounded-[17px] bg-[#26734d]/10 p-5 text-[#26734d] [&_p]:mb-0 [&_p]:mt-1 [&_p]:text-[0.86rem] [&_p]:leading-6 [&_p]:text-foreground"><Sparkles /><div><strong>{lifeStep.scenario.tipTitle}</strong><p>{lifeStep.scenario.tipBody}</p></div></aside></div>;
}

function Vocabulary({ detail, onSpeak }: { detail: ScenarioDetail; onSpeak: (text: string) => void }) {
  const { locale } = useApp();
  return <div><div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">{detail.vocabularyList.map((item, index) => <button className="grid min-h-[110px] cursor-pointer grid-cols-[36px_1fr_42px] items-center gap-3 rounded-[17px] border border-border bg-card p-4 text-left hover:border-primary" key={item.id} onClick={() => onSpeak(item.term)}><span className="font-black text-primary/35">{index + 1}</span><span className="grid gap-1"><strong className="text-base">{item.term}</strong>{locale !== "en" ? <em className="text-[0.78rem] not-italic text-primary">{item.langTerm}</em> : null}<small className="text-[0.69rem] text-muted-foreground">{item.pronunciation}</small></span><span className="grid size-[38px] place-items-center rounded-full bg-primary/10 text-primary"><Volume2 /></span></button>)}</div></div>;
}

function Conversation({ detail, partnerVoice, selfVoice }: { detail: ScenarioDetail; partnerVoice: TTSVoice; selfVoice: TTSVoice }) {
  const { locale, lifeStep } = useApp();
  const [mode, setMode] = useState<"full" | "practice">("full");
  const [line, setLine] = useState(0);
  const conversation = detail.conversationList;
  const shown = mode === "full" ? conversation : conversation.slice(line, line + 1);

  return <div><div className="mb-5 flex justify-end max-[680px]:w-full"><div className="flex rounded-xl bg-secondary p-1 max-[680px]:w-full"><button className={cn("cursor-pointer rounded-[9px] bg-transparent px-3 py-2 text-[0.68rem] font-bold text-muted-foreground max-[680px]:flex-1", mode === "full" && "bg-card text-primary shadow-sm")} onClick={() => setMode("full")}>{lifeStep.scenario.fullDialogue}</button><button className={cn("cursor-pointer rounded-[9px] bg-transparent px-3 py-2 text-[0.68rem] font-bold text-muted-foreground max-[680px]:flex-1", mode === "practice" && "bg-card text-primary shadow-sm")} onClick={() => setMode("practice")}>{lifeStep.scenario.practiceMode}</button></div></div><div className={cn(conversationPhoneClass, mode === "practice" && "[&_.conversation-messages]:min-h-[300px]")}><div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-white px-[18px] py-3.5"><div className="grid size-[38px] place-items-center rounded-full bg-primary text-[0.72rem] font-extrabold text-white">LS</div><div className="grid"><strong>{lifeStep.scenario.conversationPartner}</strong><small className="text-[0.62rem] text-[#7a847e]">{lifeStep.scenario.tapToListen}</small></div><span className="size-2 rounded-full bg-[#38a169]" /></div><div className="conversation-messages grid min-h-[450px] content-center p-5 max-[680px]:min-h-[390px] max-[680px]:p-[13px]"><p className="mx-auto mb-5 mt-3 text-center text-[0.64rem] text-[#8a938d]">{lifeStep.scenario.realLifePractice}</p>{shown.map((item) => { const self = /YOU|USER|SELF|ME/i.test(item.speaker); return <button className={cn("my-2 grid cursor-pointer justify-items-start bg-transparent text-left", self && "justify-items-end")} key={item.id} onClick={() => speak(item.message, self ? selfVoice : partnerVoice)}><span className="mx-2 mb-1 text-[0.58rem] font-extrabold uppercase text-[#6f7872]">{self ? lifeStep.scenario.you : friendlySpeaker(item.speaker)}</span><span className={cn(messageBubbleClass, self && "rounded-bl-2xl rounded-br-2xl rounded-tl-2xl rounded-tr-[5px] bg-[#d9f3e3]", mode === "practice" && "max-w-[min(90%,520px)] p-[22px] max-[680px]:max-w-[96%] [&_strong]:text-[1.1rem]")}><strong>{item.message}</strong>{locale !== "en" ? <em>{item.langMessage}</em> : null}<small><Volume2 /> {lifeStep.scenario.tapToListen}</small></span></button>; })}</div>{mode === "practice" ? <div className="border-t border-[#1d24201a] bg-white p-4"><div className="mb-3 flex items-center justify-between text-[0.65rem] text-[#68736d]"><span>{lifeStep.scenario.line} {line + 1} / {conversation.length}</span><div className="flex gap-1">{conversation.map((item, index) => <i key={item.id} className={cn("h-[3px] w-4 rounded-full bg-[#d7ddd8]", index === line && "bg-primary", index < line && "bg-[#26734d]")} />)}</div></div><div className="grid grid-cols-[40px_1fr_40px] gap-2 [&_button]:flex [&_button]:min-h-10 [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:gap-2 [&_button]:rounded-[10px] [&_button]:bg-destructive/10 [&_button]:hover:bg-destructive/20 [&_button]:dark:bg-destructive/20 [&_button]:dark:hover:bg-destructive/30 [&_button]:disabled:opacity-35"><button aria-label={lifeStep.scenario.previous} disabled={line === 0} onClick={() => setLine((value) => value - 1)}><ChevronLeft /></button><button className="bg-primary! text-[0.78rem] font-bold text-white hover:bg-primary/85!" onClick={() => speak(conversation[line].message, /YOU|USER|SELF|ME/i.test(conversation[line].speaker) ? selfVoice : partnerVoice)}><Volume2 /> {lifeStep.scenario.playLine}</button><button aria-label={lifeStep.scenario.next} disabled={line === conversation.length - 1} onClick={() => setLine((value) => value + 1)}><ChevronRight /></button></div></div> : null}</div></div>;
}

function Review({ detail, onFinish, voice }: { detail: ScenarioDetail; onFinish: () => void; voice: TTSVoice }) {
  const { lifeStep } = useApp();
  const [checked, setChecked] = useState<string[]>([]);
  const [finishing, setFinishing] = useState(false);
  const phrases = detail.review.keyPhrases;
  async function finish() { setFinishing(true); await onFinish(); setFinishing(false); }
  return <div><article className="rounded-r-2xl border-l-4 border-primary bg-secondary p-6"><small className="text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-primary">{lifeStep.scenario.whatPractised}</small><p className="mb-0 mt-2 leading-relaxed">{detail.review.summary}</p></article><section className="mt-[26px]"><h3 className="text-[0.95rem]">{lifeStep.scenario.reviewPrompt}</h3>{phrases.map((phrase) => <button key={phrase} className={cn(reviewPhraseClass, checked.includes(phrase) && "border-[#26734d]/35 bg-[#26734d]/10 [&>span]:text-[#26734d]")} onClick={() => setChecked((value) => value.includes(phrase) ? value.filter((item) => item !== phrase) : [...value, phrase])}><span>{checked.includes(phrase) ? <Check /> : <Circle />}</span><strong>{phrase}</strong><Volume2 onClick={(event) => { event.stopPropagation(); speak(phrase, voice); }} /></button>)}</section><aside className="mt-[15px] flex items-start gap-3.5 rounded-[17px] bg-[#26734d]/10 p-5 text-[#26734d] [&_small]:text-[0.65rem] [&_small]:font-extrabold [&_small]:uppercase [&_small]:tracking-[0.08em] [&_small]:text-primary [&_p]:mb-0 [&_p]:mt-1 [&_p]:text-[0.86rem] [&_p]:leading-6 [&_p]:text-foreground"><Sparkles /><div><small>{lifeStep.scenario.takeaway}</small><p>{detail.review.takeaway}</p></div></aside><button className={cn(primaryActionClass, "mt-[22px] w-full")} disabled={finishing} onClick={finish}>{finishing ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />} {lifeStep.scenario.complete}</button></div>;
}

function friendlySpeaker(speaker: string) {
  return speaker.toLowerCase().replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function speak(text: string, preferredVoice: TTSVoice = DEFAULT_TTS_SETTINGS.partner) {
  void playEdgeTTS(text, preferredVoice).catch((error) => {
    if ((error as DOMException)?.name !== "AbortError") showGlobalSnackbar("Couldn't play audio");
  });
}

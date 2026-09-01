"use client";

import { Check, LoaderCircle, RefreshCw, Shuffle, SkipForward, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppBackHeader as BackHeader } from "@/components/app";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { useLifeStepData } from "@/components/providers/lifestep-data-provider";
import { cn } from "@/lib/utils";
import { DEFAULT_TTS_SETTINGS } from "@/lib/stores/tts";
import { playEdgeTTS } from "@/lib/tts/playback";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";

const appEyebrowClass = "m-0 text-xs font-extrabold uppercase tracking-[0.1em] text-primary";
const connectionNoteClass = "my-3 rounded-xl border border-[#e4ba74] bg-[#fff7e6] px-3.5 py-2.5 text-[0.78rem] text-[#76521c] dark:bg-[#352a18] dark:text-[#e8c27f]";
const pageLoaderClass = "flex min-h-60 items-center justify-center gap-2.5 text-muted-foreground [&_svg]:animate-spin";
const primaryActionClass = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-primary bg-primary px-[22px] font-bold text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--primary)_18%,transparent)] transition duration-200 hover:-translate-y-px hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-45 disabled:transform-none [&_svg]:shrink-0";
const secondaryActionClass = `${primaryActionClass} border-border bg-transparent text-foreground shadow-none hover:bg-secondary`;
const subPageClass = "app-page pb-10";

function shuffled(items: string[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function SentencesPage() {
  const { copy, dictionary, lifeStep, voices } = useApp();
  const { keyPhrases, sentenceProgress, refreshKeyPhrases, markSentencePractised, markSentenceUnpractised, markSentenceSkipped, loading } = useLifeStepData();
  const [isShuffled, setIsShuffled] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setOrder(isShuffled ? shuffled(keyPhrases) : keyPhrases);
    setIndex(0);
  }, [isShuffled, keyPhrases]);

  const items = useMemo(() => order.filter((phrase) => keyPhrases.includes(phrase)), [keyPhrases, order]);
  const current = items[index];
  const completed = keyPhrases.filter((phrase) => sentenceProgress[phrase] === "KNOWN").length;

  async function reload() {
    setRefreshing(true);
    await refreshKeyPhrases();
    setRefreshing(false);
    setConfirmRefresh(false);
  }

  function practise() {
    if (!current) return;
    markSentencePractised(current);
    setIndex((value) => Math.min(value + 1, Math.max(0, items.length - 1)));
  }

  function skip() {
    if (!current) return;
    markSentenceUnpractised(current);
    setIndex((value) => Math.min(value + 1, Math.max(0, items.length - 1)));
  }

  function skipQuestion() {
    if (current) markSentenceSkipped(current);
    setIndex((value) => Math.min(value + 1, Math.max(0, items.length - 1)));
  }

  function speak() {
    if (!current) return;
    void playEdgeTTS(current, voices.partner || DEFAULT_TTS_SETTINGS.partner).catch((error) => {
      if ((error as DOMException)?.name !== "AbortError") showGlobalSnackbar(dictionary.newsDetail.audioFailed);
    });
  }

  return <main className={subPageClass}>
    <BackHeader title={lifeStep.practice.sentenceTitle} eyebrow={lifeStep.practice.sentenceEyebrow} />
    <section className="app-content-width flex flex-wrap items-end justify-between gap-4 pb-5 pt-4 max-md:pt-2"><div><p className={appEyebrowClass}>{lifeStep.practice.offlinePractice}</p><h1 className="mb-1 mt-1 text-[2.25rem] tracking-[-0.06em] max-[680px]:text-[1.8rem]">{lifeStep.practice.sentenceHeading}</h1><p className="m-0 text-muted-foreground">{completed} of {keyPhrases.length || "—"} {lifeStep.practice.phrasesPractised}</p></div><div className="flex gap-2"><button className={secondaryActionClass} onClick={() => setIsShuffled((value) => !value)}><Shuffle /> {isShuffled ? lifeStep.practice.shuffled : lifeStep.practice.inOrder}</button><button className={secondaryActionClass} disabled={refreshing} onClick={() => setConfirmRefresh(true)}><RefreshCw className={refreshing ? "animate-spin" : undefined} /> {lifeStep.practice.reloadList}</button></div></section>
    {loading && !keyPhrases.length ? <div className={pageLoaderClass}><LoaderCircle className="animate-spin" /><span>{copy.loading}</span></div> : current ? <section className="app-content-width pb-10"><div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>{lifeStep.practice.phraseProgress.replace("{{current}}", String(index + 1)).replace("{{total}}", String(items.length))}</span><span>{Math.round((completed / Math.max(1, keyPhrases.length)) * 100)}%</span></div><div className="rounded-[26px] border border-border bg-card p-8 text-center shadow-sm max-[680px]:p-6"><span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary"><Volume2 /></span><p className="m-0 text-[2rem] font-bold leading-tight tracking-[-0.04em] max-[680px]:text-[1.65rem]">{current}</p><button className="mx-auto mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-secondary px-4 py-2 text-sm font-bold text-foreground" onClick={speak}><Volume2 /> {lifeStep.practice.listen}</button></div><div className="mt-4 grid grid-cols-3 gap-3"><button className={cn(secondaryActionClass, "justify-center px-2")} onClick={skip}><X /> {lifeStep.practice.notKnown}</button><button className={cn(secondaryActionClass, "justify-center px-2")} onClick={skipQuestion}><SkipForward /> {lifeStep.practice.skip}</button><button className={cn(primaryActionClass, "justify-center px-2")} onClick={practise}><Check /> {lifeStep.practice.known}</button></div></section> : <div className={cn("app-content-width", connectionNoteClass)}>{lifeStep.practice.noPhrases}</div>}
    {confirmRefresh ? <Modal onClose={() => !refreshing && setConfirmRefresh(false)} labelledBy="reload-sentences-title" locked={refreshing}><div className="text-center"><RefreshCw className="mx-auto mb-4 size-10 text-primary" /><h2 className="m-0 text-[1.7rem]" id="reload-sentences-title">{lifeStep.practice.reloadSentenceTitle}</h2><p className="my-3 leading-6 text-muted-foreground">{lifeStep.practice.reloadBody}</p><button className={cn(primaryActionClass, "w-full")} disabled={refreshing} onClick={reload}>{refreshing ? <LoaderCircle className="animate-spin" /> : null}{lifeStep.practice.confirmReload}</button></div></Modal> : null}
  </main>;
}

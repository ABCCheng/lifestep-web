"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpDown, BriefcaseBusiness, GraduationCap, HeartHandshake, LoaderCircle, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { DesktopAppHeader } from "@/components/shell/DesktopAppHeader";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { journeyOrders, stageMeta } from "@/lib/content";
import { useLifeStepData } from "@/components/providers/lifestep-data-provider";
import { localizePath } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JourneyType, LifeStage } from "@/lib/types";
import { getStoredJourneyType, saveJourneyType, subscribeStoredJourneyType } from "@/lib/stores/journey";

const appEyebrowClass = "m-0 text-xs font-extrabold uppercase tracking-[0.1em] text-primary";
const connectionNoteClass = "my-3 rounded-xl border border-[#e4ba74] bg-[#fff7e6] px-3.5 py-2.5 text-[0.78rem] text-[#76521c] dark:bg-[#352a18] dark:text-[#e8c27f]";
const primaryActionClass = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-primary bg-primary px-[22px] font-bold text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--primary)_18%,transparent)] transition duration-200 hover:-translate-y-px hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-45 disabled:transform-none [&_svg]:shrink-0";

const journeyTopSectionClass =
  "app-shell-width grid items-stretch gap-3 pb-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-4 lg:pb-5";

const journeyTitleClass =
  "flex flex-col items-start gap-2 pt-1 lg:px-4 lg:py-2 max-md:pt-2";

const journeySummaryCardClass =
  "min-h-0 self-stretch overflow-hidden rounded-[20px] border border-border bg-card p-3 shadow-sm max-[680px]:rounded-[18px] lg:self-start lg:h-fit";

const journeySummaryGridClass =
  "relative grid min-h-0 grid-cols-[1fr_0.9fr] gap-x-3 max-[680px]:gap-x-2";

const journeySummaryPracticeClass =
  "grid min-w-0 gap-3 rounded-l-xl border-r border-border pr-3";

const journeySummaryJourneyClass =
  "flex min-w-0 flex-col gap-3 transition-colors hover:text-primary";

const journeySummaryItemClass =
  "block min-w-0 no-underline transition-colors hover:text-primary";

const journeyMapClass =
  "app-shell-width relative isolate mb-[45px] min-h-[1500px] overflow-hidden rounded-[30px] border border-[#1d242014] bg-[#dfeadd] pb-[120px] pt-[55px] before:absolute before:-bottom-[60px] before:-left-[10%] before:-right-[10%] before:-z-1 before:h-[27%] before:rounded-t-[50%] before:bg-[#c5dcc5] before:content-[''] dark:bg-[#203226] dark:before:bg-[#2b4433]";

const routeSpineClass =
  "absolute bottom-[145px] left-1/2 top-[100px] w-2 -translate-x-1/2 rounded-[20px] bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,.95)_0_14px,transparent_14px_24px)] opacity-90";

const mapCloudClass =
  "absolute h-5 w-[70px] rounded-[30px] bg-white/80 before:absolute before:bottom-0 before:left-2.5 before:size-[30px] before:rounded-full before:bg-[inherit] before:content-[''] after:absolute after:bottom-0 after:right-[7px] after:size-10 after:rounded-full after:bg-[inherit] after:content-['']";

const mountainsClass =
  "absolute left-[2%] top-[6%] flex items-end [&>span]:-mr-[45px] [&>span]:size-0 [&>span]:border-x-[60px] [&>span]:border-b-[110px] [&>span]:border-x-transparent [&>span]:border-b-[#a8c4a8] [&>span:nth-child(2)]:border-x-[80px] [&>span:nth-child(2)]:border-b-[150px] [&>span:nth-child(2)]:border-b-[#96b897] [&>span:nth-child(3)]:border-b-[#b5cdb4]";

const stopRowClasses = [
  "-translate-x-[16%] max-[900px]:-translate-x-[10%]",
  "translate-x-[9%] max-[900px]:translate-x-[7%]",
  "translate-x-[18%] max-[900px]:translate-x-[10%]",
  "-translate-x-[7%] max-[900px]:-translate-x-[5%]",
] as const;

const journeyStopBaseClass =
  "relative grid min-h-[92px] w-[min(370px,70vw)] cursor-pointer grid-cols-[54px_1fr] items-center gap-3 rounded-[19px] border border-[#1d242021] bg-white/85 py-2.5 pl-2.5 pr-[18px] text-left text-[#1d2420] shadow-[0_9px_24px_rgba(37,58,45,.09)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_30px_rgba(37,58,45,.15)]";

const journeyChoiceButtonClass =
  "grid min-h-[82px] cursor-pointer grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[15px] border border-border bg-card p-3 text-left hover:border-primary hover:bg-primary/5 [&>span:first-child]:grid [&>span:first-child]:size-12 [&>span:first-child]:place-items-center [&>span:first-child]:rounded-[13px] [&>span:first-child]:bg-primary/10 [&>span:first-child]:text-primary [&>div]:grid [&>div]:gap-1 [&_small]:text-[0.7rem] [&_small]:text-muted-foreground [&>svg]:text-primary";

export default function JourneyPage() {
  const { locale, copy, lifeStep } = useApp();
  const router = useRouter();
  const { ensureJourneyData, getScenarios, getStageProgress, journeyReady, keyPhrases, practiceReady, refreshJourneyData, sentenceProgress, vocabulary, vocabularyProgress } = useLifeStepData();
  const journeyType = useSyncExternalStore(subscribeStoredJourneyType, getStoredJourneyType, () => null);
  const [needsChoice, setNeedsChoice] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [pendingJourneyType, setPendingJourneyType] = useState<JourneyType | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setNeedsChoice(!getStoredJourneyType());
  }, []);

  useEffect(() => {
    if (!journeyType) return;
    let active = true;
    setLoading(true);
    ensureJourneyData(journeyType)
      .then((data) => active && setPreview(!data))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [ensureJourneyData, journeyType]);

  function requestJourneyChange(type: JourneyType) {
    setNeedsChoice(false);
    setPendingJourneyType(type);
    setConfirmRefresh(true);
  }

  function openStage(stage: LifeStage) {
    router.push(`${localizePath("/stage", locale)}?stage=${stage}&journey=${activeJourneyType}`);
  }

  async function confirmJourneyChange() {
    if (!pendingJourneyType) return;
    setRefreshing(true);
    const success = await refreshJourneyData(pendingJourneyType);
    setRefreshing(false);
    if (!success) return;

    saveJourneyType(pendingJourneyType);
    setPreview(false);
    setConfirmRefresh(false);
    setPendingJourneyType(null);
  }

  const activeJourneyType = journeyType || "STUDY";
  const stages = useMemo(() => journeyOrders[activeJourneyType], [activeJourneyType]);
  const progressMap = useMemo(() => new Map(stages.map((stage) => [stage, getStageProgress(activeJourneyType, stage)])), [activeJourneyType, getStageProgress, stages]);
  const current = stages.find((stage) => (progressMap.get(stage) || 0) > 0 && (progressMap.get(stage) || 0) < 100) || stages.find((stage) => (progressMap.get(stage) || 0) === 0) || stages.at(-1);
  const journeySummary = useMemo(() => {
    if (!journeyType) return { total: 0, completed: 0 };
    return stages.reduce((summary, stage) => {
      const scenarios = getScenarios(activeJourneyType, stage);
      return { total: summary.total + scenarios.length, completed: summary.completed + scenarios.filter((item) => item.progressStatus === "COMPLETED").length };
    }, { total: 0, completed: 0 });
  }, [activeJourneyType, getScenarios, journeyType, stages]);
  const journeyPercent = journeySummary.total ? Math.round((journeySummary.completed / journeySummary.total) * 100) : 0;
  const currentMeta = stageMeta[current || "ARRIVE"];
  const currentProgress = progressMap.get(current || "ARRIVE") || 0;
  const knownWords = vocabulary.filter((item) => vocabularyProgress[String(item.id)] === "KNOWN").length;
  const knownPhrases = keyPhrases.filter((phrase) => sentenceProgress[phrase] === "KNOWN").length;
  const wordPercent = vocabulary.length ? Math.round((knownWords / vocabulary.length) * 100) : 0;
  const phrasePercent = keyPhrases.length ? Math.round((knownPhrases / keyPhrases.length) * 100) : 0;
  const pageReady = journeyReady && Boolean(journeyType);
  const choices: Array<{ type: JourneyType; icon: React.ReactNode; title: string; body: string }> = [
    { type: "STUDY", icon: <GraduationCap />, title: lifeStep.journey.study, body: lifeStep.journey.studyBody },
    { type: "WORK", icon: <BriefcaseBusiness />, title: lifeStep.journey.work, body: lifeStep.journey.workBody },
    { type: "FAMILY", icon: <HeartHandshake />, title: lifeStep.journey.family, body: lifeStep.journey.familyBody },
  ];
  // Journey type is already persisted locally, so show it immediately. The
  // hydrated value is still used for data-dependent map and progress content.
  const journeyChoice = choices.find((choice) => choice.type === journeyType);
  const journeyLabel = journeyChoice
    ? ["zh-Hans", "zh-Hant"].includes(locale)
      ? `${journeyChoice.title}${lifeStep.journey.title}`
      : `${journeyChoice.title} ${lifeStep.journey.title}`
    : lifeStep.journey.title;

  return (
    <main className="app-page text-foreground">
      <DesktopAppHeader />
      <section className={journeyTopSectionClass} aria-busy={!pageReady}>
        <div className={journeyTitleClass}><div className="flex min-h-7 items-center gap-2"><p suppressHydrationWarning className={cn(appEyebrowClass, "text-sm")}>{journeyLabel}</p><Button suppressHydrationWarning type="button" variant="ghost" size="icon-sm" className="cursor-pointer bg-transparent text-primary hover:bg-transparent hover:text-primary" aria-label={journeyType ? lifeStep.journey.changePath : lifeStep.journey.choosePath} title={journeyType ? lifeStep.journey.changePath : lifeStep.journey.choosePath} onClick={() => setNeedsChoice(true)}><ArrowUpDown className="size-4" /></Button></div><h1 className="m-0 min-h-[1.15em] text-[clamp(2.3rem,5vw,4rem)] tracking-[-0.065em]">{pageReady ? (currentProgress ? lifeStep.journey.resumeJourney : lifeStep.journey.startJourney) : <span className="block h-[1em] w-[min(82vw,420px)] animate-pulse rounded-lg bg-secondary" aria-hidden="true" />}</h1></div>
        <div className={journeySummaryCardClass}>
          <div className={journeySummaryGridClass}>
            <div className={journeySummaryPracticeClass}>
              <Link className={journeySummaryItemClass} href={localizePath("/vocabulary", locale)}><div className="flex h-5 items-center justify-between gap-2"><p className={cn(appEyebrowClass, "text-xs")}>{lifeStep.journey.words}</p><span className="flex items-center gap-1">{practiceReady ? <strong className="text-xl leading-none tracking-[-0.04em]">{wordPercent}%</strong> : <span className="block h-5 w-10 animate-pulse rounded bg-secondary" aria-hidden="true" />}<ArrowRight className="size-3 shrink-0 text-primary" /></span></div><small className="mt-0.5 block h-4 truncate text-[0.7rem] leading-4 text-muted-foreground">{practiceReady ? `${knownWords}/${vocabulary.length || "—"} ${lifeStep.journey.recognized}` : <span className="block h-3 w-24 animate-pulse rounded bg-secondary" aria-hidden="true" />}</small><div className="mt-0.5 h-1 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-[inherit] bg-primary" style={{ width: `${practiceReady ? wordPercent : 0}%` }} /></div></Link>
              <Link className={journeySummaryItemClass} href={localizePath("/sentences", locale)}><div className="flex h-5 items-center justify-between gap-2"><p className={cn(appEyebrowClass, "text-xs")}>{lifeStep.journey.sentences}</p><span className="flex items-center gap-1">{practiceReady ? <strong className="text-xl leading-none tracking-[-0.04em]">{phrasePercent}%</strong> : <span className="block h-5 w-10 animate-pulse rounded bg-secondary" aria-hidden="true" />}<ArrowRight className="size-3 shrink-0 text-primary" /></span></div><small className="mt-0.5 block h-4 truncate text-[0.7rem] leading-4 text-muted-foreground">{practiceReady ? `${knownPhrases}/${keyPhrases.length || "—"} ${lifeStep.journey.recognized}` : <span className="block h-3 w-24 animate-pulse rounded bg-secondary" aria-hidden="true" />}</small><div className="mt-0.5 h-1 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-[inherit] bg-primary" style={{ width: `${practiceReady ? phrasePercent : 0}%` }} /></div></Link>
            </div>
            <div role="button" tabIndex={0} className={journeySummaryJourneyClass} onClick={() => openStage(current || "ARRIVE")} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openStage(current || "ARRIVE"); } }} aria-label={`${currentProgress ? copy.resume : copy.start}: ${currentMeta.title}`}>
              <div className="min-w-0">
                <div className="flex h-5 items-center justify-between gap-2"><p className={cn(appEyebrowClass, "text-xs")}>{journeyLabel}</p><span className="flex items-center gap-1">{pageReady ? <strong className="text-xl leading-none tracking-[-0.04em]">{journeyPercent}%</strong> : <span className="block h-5 w-10 animate-pulse rounded bg-secondary" aria-hidden="true" />}<ArrowRight className="size-3 shrink-0 text-primary" /></span></div>
                <small className="mt-0.5 block h-4 truncate text-[0.7rem] leading-4 text-muted-foreground">{pageReady ? `${journeySummary.completed}/${journeySummary.total || "—"} ${lifeStep.journey.complete}` : <span className="block h-3 w-24 animate-pulse rounded bg-secondary" aria-hidden="true" />}</small>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-[inherit] bg-primary transition-[width]" style={{ width: `${journeyPercent}%` }} /></div>
              </div>
              <div className="min-w-0 text-left">
                <div className="flex h-5 items-center justify-between gap-2"><p className={cn(appEyebrowClass, "text-xs")}>{lifeStep.journey.currentPosition}</p></div>
                <small className="mt-0.5 block h-4 truncate text-[0.7rem] leading-4 text-muted-foreground">{pageReady ? currentMeta.title : <span className="block h-3 w-28 animate-pulse rounded bg-secondary" aria-hidden="true" />}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {preview ? <div className={cn("app-shell-width", connectionNoteClass)}>{copy.offline}</div> : null}

      <section className={journeyMapClass} aria-label={lifeStep.journey.mapLabel}>
        <span className="absolute -left-[180px] top-[29%] -z-1 h-[180px] w-[560px] -rotate-[18deg] rounded-[50%] border-[25px] border-x-transparent border-y-[#c0ddea]" /><span className="absolute -right-[170px] top-[64%] -z-1 h-[180px] w-[560px] rotate-[22deg] rounded-[50%] border-[25px] border-x-transparent border-y-[#c0ddea]" />
        <span className={cn(mapCloudClass, "right-[10%] top-[7%]")} /><span className={cn(mapCloudClass, "left-[6%] top-1/2 scale-70")} />
        <div className={mountainsClass}><span /><span /><span /></div>
        <div className={routeSpineClass} />
        {loading || !pageReady ? <div className="absolute inset-0 z-5 flex items-center justify-center gap-2.5 bg-[#dfeadd]/65 backdrop-blur-sm [&_svg]:animate-spin"><LoaderCircle /><span>{copy.loading}</span></div> : null}
        <div className="relative z-2 grid gap-5 max-[680px]:px-[13px]">
          {stages.map((stage, index) => {
            const value = progressMap.get(stage) ?? (preview ? (index < 2 ? 100 : index === 2 ? 35 : 0) : 0);
            const meta = stageMeta[stage];
            const progressRing = value >= 100
              ? { background: "#26734d" }
              : value > 0
                ? { background: `conic-gradient(from -90deg, var(--primary) 0 ${value}%, #d3ddd4 ${value}% 100%)` }
                : undefined;
            return (
              <div className={cn("flex min-h-[92px] items-center justify-center", stopRowClasses[index % 4])} key={stage}>
                <button className={journeyStopBaseClass} onClick={() => openStage(stage)} aria-label={`${meta.title}, ${value}%`}>
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-white/70 px-1 text-[0.6rem] font-extrabold text-[#1d242057]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="grid size-[62px] place-items-center rounded-full bg-white p-1 text-[1.35rem] shadow-[0_4px_14px_rgba(0,0,0,.08)]" style={progressRing}><span className="grid size-full place-items-center rounded-full bg-[#e6ebe6]">{meta.icon}</span></span>
                  <span className="grid min-w-0 gap-1 [&_strong]:break-words [&_strong]:text-[0.96rem] [&_small]:break-words [&_small]:text-[0.7rem] [&_small]:text-[#6b756f]"><strong>{meta.title}</strong>{locale !== "en" ? <small>{meta.translated[locale] ?? meta.title}</small> : null}</span>
                  {current === stage ? <span className="absolute -top-[15px] right-[15px] grid size-7 place-items-center rounded-full bg-primary text-white shadow-[0_5px_13px_color-mix(in_srgb,var(--primary)_25%,transparent)] max-[680px]:right-2.5"><MapPin className="size-4" /></span> : null}
                </button>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-[45px] left-1/2 flex -translate-x-1/2 items-center gap-3 text-[#315640] dark:text-[#a8d9b9]"><span className="text-[2rem]">🍁</span><strong className="font-serif text-[0.88rem] italic">{lifeStep.journey.footerFirst}<br />{lifeStep.journey.footerSecond}</strong></div>
      </section>

      {needsChoice && hydrated ? (
        <Modal onClose={() => journeyType && setNeedsChoice(false)} labelledBy="journey-question" locked={!journeyType}>
          <div className="text-center">
            <h2 className="m-0 text-[2.15rem] tracking-[-0.055em] max-[680px]:text-[1.8rem]" id="journey-question">{lifeStep.journey.chooseTitle}</h2>
            <p className="mx-auto mb-6 mt-2.5 leading-6 text-muted-foreground">{lifeStep.journey.chooseBody}</p>
            <div className="grid gap-2.5">
              {choices.map((choice) => <button className={cn(journeyChoiceButtonClass, journeyType === choice.type && "border-2 border-primary bg-primary/5")} key={choice.type} onClick={() => requestJourneyChange(choice.type)}><span>{choice.icon}</span><div><strong>{choice.title}</strong><small>{choice.body}</small></div>{journeyType === choice.type ? <RefreshCw /> : <ArrowRight />}</button>)}
            </div>
          </div>
        </Modal>
      ) : null}

      {confirmRefresh ? <Modal onClose={() => { if (!refreshing) { setConfirmRefresh(false); setPendingJourneyType(null); setNeedsChoice(true); } }} labelledBy="journey-action-title" locked={refreshing}>
        <div className="text-center"><h2 className="m-0 text-[1.7rem]" id="journey-action-title">{pendingJourneyType === journeyType ? lifeStep.journey.reloadTitle : lifeStep.journey.switchTitle.replace("{{journey}}", choices.find((choice) => choice.type === pendingJourneyType)?.title || lifeStep.journey.title)}</h2><p className="my-3 leading-6 text-muted-foreground">{lifeStep.journey.reloadBody}</p><button className={cn(primaryActionClass, "w-full")} disabled={refreshing} onClick={confirmJourneyChange}>{refreshing ? <LoaderCircle className="animate-spin" /> : null}{pendingJourneyType === journeyType ? lifeStep.journey.confirmReload : lifeStep.journey.confirmSwitch}</button></div>
      </Modal> : null}

    </main>
  );
}

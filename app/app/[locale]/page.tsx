"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Check, GraduationCap, HeartHandshake, LoaderCircle, MapPin, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DesktopAppHeader } from "@/components/shell/DesktopAppHeader";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { journeyOrders, stageMeta } from "@/lib/content";
import { lifeStepApi } from "@/lib/api";
import { localizePath } from "@/lib/i18n";
import { appEyebrowClass, connectionNoteClass, primaryActionClass, translatedClass } from "@/components/app/app-ui-styles";
import { cn } from "@/lib/utils";
import type { JourneyStageProgress, JourneyType, LifeStage, ProgressStatus } from "@/lib/types";
import { journeyChoiceButtonClass, journeyIntroClass, journeyMapClass, journeyStopBaseClass, journeySwitchClass, mapCloudClass, modalHeadingClass, mountainsClass, routeSpineClass, stopRowClasses } from "./journey-styles";

const choices: Array<{ type: JourneyType; icon: React.ReactNode; title: string; body: string }> = [
  { type: "STUDY", icon: <GraduationCap />, title: "Study", body: "Build confidence for campus and everyday life." },
  { type: "WORK", icon: <BriefcaseBusiness />, title: "Work", body: "Settle in, find work, and grow your career." },
  { type: "FAMILY", icon: <HeartHandshake />, title: "Family", body: "Create a confident new life for your family." },
];

function getJourneyType() {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem("lifestep-journey-type");
  return value === "STUDY" || value === "WORK" || value === "FAMILY" ? value : null;
}

export default function JourneyPage() {
  const { locale, copy } = useApp();
  const [journeyType, setJourneyType] = useState<JourneyType | null>(null);
  const [needsChoice, setNeedsChoice] = useState(false);
  const [progress, setProgress] = useState<JourneyStageProgress[]>([]);
  const [selected, setSelected] = useState<LifeStage | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const stored = getJourneyType();
    setJourneyType(stored);
    setNeedsChoice(!stored);
  }, []);

  useEffect(() => {
    if (!journeyType) return;
    let active = true;
    setLoading(true);
    lifeStepApi.journeyProgress(journeyType)
      .then((data) => active && setProgress(data || []))
      .catch(() => active && setPreview(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [journeyType]);

  function choose(type: JourneyType) {
    localStorage.setItem("lifestep-journey-type", type);
    setJourneyType(type);
    setNeedsChoice(false);
  }

  const stages = journeyOrders[journeyType || "STUDY"];
  const progressMap = useMemo(() => new Map(progress.map((item) => [item.lifeStage, item.progress])), [progress]);
  const current = stages.find((stage) => (progressMap.get(stage) || 0) > 0 && (progressMap.get(stage) || 0) < 100) || stages.find((stage) => (progressMap.get(stage) || 0) === 0) || stages.at(-1);

  return (
    <main className="app-page text-foreground">
      <DesktopAppHeader />
      <section className={journeyIntroClass}>
        <div><p className={appEyebrowClass}>{journeyType ? `${choices.find((item) => item.type === journeyType)?.title} journey` : "Your Canadian journey"}</p><h1>{copy.journey}</h1><p>Each stop prepares you for a moment that matters.</p></div>
        <button className={journeySwitchClass} onClick={() => setNeedsChoice(true)}><RotateCcw /> Change path</button>
      </section>

      {preview ? <div className={cn("app-shell-width", connectionNoteClass)}>{copy.offline}</div> : null}

      <section className={journeyMapClass} aria-label="Life stages map">
        <span className="absolute -left-[180px] top-[29%] -z-1 h-[180px] w-[560px] -rotate-[18deg] rounded-[50%] border-[25px] border-x-transparent border-y-[#c0ddea]" /><span className="absolute -right-[170px] top-[64%] -z-1 h-[180px] w-[560px] rotate-[22deg] rounded-[50%] border-[25px] border-x-transparent border-y-[#c0ddea]" />
        <span className={cn(mapCloudClass, "right-[10%] top-[7%]")} /><span className={cn(mapCloudClass, "left-[6%] top-1/2 scale-70")} />
        <div className={mountainsClass}><span /><span /><span /></div>
        <div className={routeSpineClass} />
        {loading ? <div className="absolute inset-0 z-5 flex items-center justify-center gap-2.5 bg-[#dfeadd]/65 backdrop-blur-sm [&_svg]:animate-spin"><LoaderCircle /><span>{copy.loading}</span></div> : null}
        <div className="relative z-2 grid gap-5 max-[680px]:gap-4 max-[680px]:px-[13px]">
          {stages.map((stage, index) => {
            const value = progressMap.get(stage) ?? (preview ? (index < 2 ? 100 : index === 2 ? 35 : 0) : 0);
            const status: ProgressStatus = value >= 100 ? "COMPLETED" : value > 0 ? "IN_PROGRESS" : "NOT_STARTED";
            const meta = stageMeta[stage];
            return (
              <div className={cn("flex min-h-[92px] items-center justify-center max-[680px]:justify-start max-[680px]:translate-x-0", stopRowClasses[index % 4])} key={stage}>
                <button className={cn(journeyStopBaseClass, status === "IN_PROGRESS" && "border-2 border-primary", current === stage && "[&>span:nth-child(2)]:bg-primary")} onClick={() => setSelected(stage)} aria-label={`${meta.title}, ${value}%`}>
                  <span className="absolute -left-8 text-[0.68rem] font-extrabold text-[#1d242057] max-[680px]:hidden">{String(index + 1).padStart(2, "0")}</span>
                  <span className={cn("grid size-[54px] place-items-center rounded-full border-4 border-white bg-[#e6ebe6] text-[1.35rem] shadow-[0_4px_14px_rgba(0,0,0,.08)] [&_svg]:text-white max-[680px]:size-12", status === "COMPLETED" && "bg-[#26734d]", status === "IN_PROGRESS" && "bg-primary")}>{status === "COMPLETED" ? <Check /> : meta.icon}</span>
                  <span className="grid gap-1 [&_strong]:text-[0.96rem] [&_small]:text-[0.7rem] [&_small]:text-[#6b756f]"><strong>{meta.title}</strong><small>{meta.translated[locale] ?? meta.title}</small></span>
                  {current === stage ? <span className="absolute -top-[15px] right-[15px] flex items-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-[0.59rem] font-extrabold uppercase text-white shadow-[0_5px_13px_color-mix(in_srgb,var(--primary)_25%,transparent)] max-[680px]:right-2.5"><MapPin /> You are here</span> : null}
                </button>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-[45px] left-1/2 flex -translate-x-1/2 items-center gap-3 text-[#315640] dark:text-[#a8d9b9] max-[680px]:left-[22px] max-[680px]:translate-x-0"><span className="text-[2rem]">🍁</span><strong className="font-serif text-[0.88rem] italic">Your new life,<br />one step closer.</strong></div>
      </section>

      {needsChoice ? (
        <Modal onClose={() => journeyType && setNeedsChoice(false)} labelledBy="journey-question" locked={!journeyType}>
          <div className="text-center">
            <span className="mb-3 inline-block text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-primary">Let&apos;s make this yours</span>
            <h2 className="m-0 text-[2.15rem] tracking-[-0.055em] max-[680px]:text-[1.8rem]" id="journey-question">What brings you to Canada?</h2>
            <p className="mx-auto mb-6 mt-2.5 leading-6 text-muted-foreground">Choose the path that fits you best. You can change it later.</p>
            <div className="grid gap-2.5">
              {choices.map((choice) => <button className={journeyChoiceButtonClass} key={choice.type} onClick={() => choose(choice.type)}><span>{choice.icon}</span><div><strong>{choice.title}</strong><small>{choice.body}</small></div><ArrowRight /></button>)}
            </div>
          </div>
        </Modal>
      ) : null}

      {selected ? <StageModal stage={selected} progress={progressMap.get(selected) ?? 0} onClose={() => setSelected(null)} journeyType={journeyType || "STUDY"} /> : null}
    </main>
  );
}

function StageModal({ stage, progress, onClose, journeyType }: { stage: LifeStage; progress: number; onClose: () => void; journeyType: JourneyType }) {
  const { locale, copy } = useApp();
  const meta = stageMeta[stage];
  const button = progress >= 100 ? copy.restart : progress > 0 ? copy.resume : copy.start;
  return (
    <Modal onClose={onClose} labelledBy="stage-modal-title">
      <div className="text-center">
        <div className="mx-auto mb-5 grid size-[78px] place-items-center rounded-3xl bg-secondary text-[2.25rem]">{meta.icon}</div>
        <p className={appEyebrowClass}>Life stage</p>
        <h2 className={modalHeadingClass} id="stage-modal-title">{meta.title}</h2>
        {locale !== "en" ? <h3 className="mb-4 mt-1.5 text-base font-semibold text-muted-foreground">{meta.translated[locale] ?? meta.title}</h3> : null}
        <p className="my-2.5 leading-6 text-muted-foreground">{meta.description}</p>
        {locale !== "en" ? <p className={cn("my-2.5 leading-6", translatedClass)}>{meta.translatedDescription[locale] ?? meta.description}</p> : null}
        <div className="mt-6 flex justify-between text-xs"><span>{copy.progress}</span><strong>{progress}%</strong></div>
        <div className="mb-6 mt-2 h-2 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-[inherit] bg-primary" style={{ width: `${progress}%` }} /></div>
        <Link className={cn(primaryActionClass, "w-full")} href={`${localizePath("/stage", locale)}?stage=${stage}&journey=${journeyType}`}>{button}<ArrowRight /></Link>
      </div>
    </Modal>
  );
}

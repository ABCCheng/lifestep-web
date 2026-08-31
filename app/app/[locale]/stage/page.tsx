"use client";

import { ArrowRight, Check, Circle, Clock3, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppBackHeader as BackHeader } from "@/components/app";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { useLifeStepData } from "@/components/providers/lifestep-data-provider";
import { mockScenarios, stageMeta } from "@/lib/content";
import { localizePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { JourneyType, LifeScenario, LifeStage, ProgressStatus } from "@/lib/types";

const connectionNoteClass = "my-3 rounded-xl border border-[#e4ba74] bg-[#fff7e6] px-3.5 py-2.5 text-[0.78rem] text-[#76521c] dark:bg-[#352a18] dark:text-[#e8c27f]";
const pageLoaderClass = "flex min-h-60 items-center justify-center gap-2.5 text-muted-foreground [&_svg]:animate-spin";
const primaryActionClass = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-primary bg-primary px-[22px] font-bold text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--primary)_18%,transparent)] transition duration-200 hover:-translate-y-px hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-45 disabled:transform-none [&_svg]:shrink-0";
const subPageClass = "app-page pb-10";
const translatedClass = "text-[0.9em] text-muted-foreground!";

const stageHeroClass =
  "app-content-width grid grid-cols-[72px_1fr] items-stretch gap-4 pb-7 pt-[38px] max-[680px]:grid-cols-[60px_1fr] max-[680px]:gap-3 max-[680px]:pt-2";

const stageHeroVisualClass =
  "flex min-w-0 flex-col items-center justify-center gap-1.5";

const stageHeroIconClass =
  "grid size-16 place-items-center rounded-[19px] bg-primary/10 text-[2.05rem] leading-none max-[680px]:size-12 max-[680px]:rounded-[15px] max-[680px]:text-[1.65rem]";

const stageHeroProgressClass =
  "text-sm font-extrabold leading-5 tracking-[-0.02em] text-primary [&_span]:font-semibold [&_span]:text-muted-foreground";

const stageHeroCopyClass =
  "flex min-w-0 items-center border-l border-border pl-4 max-[680px]:pl-3";

const scenarioRowClass =
  "grid min-h-[98px] cursor-pointer grid-cols-[48px_1fr_auto] items-start gap-3.5 rounded-[17px] border border-border bg-card px-4 py-3 text-left transition duration-200 hover:translate-x-[3px] hover:border-primary/40 max-[680px]:grid-cols-[42px_1fr_auto] max-[680px]:gap-2.5 max-[680px]:p-3";

const statusPillClass =
  "my-2 mb-[22px] inline-flex rounded-full bg-secondary px-2.5 py-1.5 text-[0.68rem] font-bold uppercase text-muted-foreground";

export default function StagePage() {
  return <Suspense fallback={<div className={pageLoaderClass}><LoaderCircle /></div>}><StageContent /></Suspense>;
}

function StageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { locale, copy, lifeStep } = useApp();
  const { ensureJourneyData, getScenarios, markScenarioStarted } = useLifeStepData();
  const stage = (params.get("stage") || "ARRIVE") as LifeStage;
  const journeyType = (params.get("journey") || "STUDY") as JourneyType;
  const meta = stageMeta[stage] || stageMeta.ARRIVE;
  const [scenarios, setScenarios] = useState<LifeScenario[]>([]);
  const [selected, setSelected] = useState<LifeScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    ensureJourneyData(journeyType)
      .then((data) => {
        if (!active) return;
        const nextScenarios = getScenarios(journeyType, stage);
        setScenarios(nextScenarios.length ? nextScenarios : mockScenarios(stage));
        setPreview(!data);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [ensureJourneyData, getScenarios, journeyType, stage]);

  async function openScenario() {
    if (!selected) return;
    setStarting(true);
    markScenarioStarted(journeyType, selected.id);
    const index = scenarios.findIndex((item) => item.id === selected.id);
    const next = scenarios[index + 1];
    const query = new URLSearchParams({ id: String(selected.id), stage, journey: journeyType, title: selected.title, langTitle: selected.langTitle });
    if (next) { query.set("nextId", String(next.id)); query.set("nextTitle", next.title); query.set("nextLangTitle", next.langTitle); }
    router.push(`${localizePath("/scenario", locale)}?${query.toString()}`);
  }

  const completed = scenarios.filter((item) => item.progressStatus === "COMPLETED").length;

  return (
    <main className={subPageClass}>
      <BackHeader title={meta.title} eyebrow={locale === "en" ? lifeStep.journey.lifeStage : meta.translated[locale]} />
      <section className={stageHeroClass}>
        <div className={stageHeroVisualClass}>
          <div className={stageHeroIconClass}>{meta.icon}</div>
          <strong className={stageHeroProgressClass}>{completed}<span>/{scenarios.length}</span></strong>
        </div>
        <div className={stageHeroCopyClass}><div><p className="m-0 text-base font-bold leading-6 text-foreground max-[680px]:text-[0.86rem]">{meta.description}</p>{locale !== "en" ? <p className={cn("mb-0 mt-1.5 text-sm leading-5", translatedClass)}>{meta.translatedDescription[locale]}</p> : null}</div></div>
      </section>
      {preview ? <div className={cn("app-content-width", connectionNoteClass)}>{copy.offline}</div> : null}

      <section className="app-content-width grid gap-2.5 pb-10 pt-2.5" aria-label={lifeStep.journey.scenarios}>
        {loading ? <div className={pageLoaderClass}><LoaderCircle /><span>{copy.loading}</span></div> : scenarios.map((scenario, index) => (
          <button className={scenarioRowClass} key={scenario.id} onClick={() => setSelected(scenario)}>
            <span className={cn("grid size-11 place-items-center self-center rounded-full bg-secondary text-muted-foreground", scenario.progressStatus === "COMPLETED" && "bg-[#26734d]/10 text-[#26734d]", scenario.progressStatus === "IN_PROGRESS" && "bg-primary/10 text-primary")}>{scenario.progressStatus === "COMPLETED" ? <Check /> : scenario.progressStatus === "IN_PROGRESS" ? <Clock3 /> : <Circle />}</span>
            <span className="grid min-w-0 gap-1"><small className="text-[0.59rem] font-extrabold uppercase tracking-[0.08em] text-primary">{lifeStep.journey.scenario} {String(index + 1).padStart(2, "0")}</small><strong className="text-[0.96rem]">{scenario.title}</strong>{locale !== "en" ? <em className="text-[0.72rem] not-italic text-muted-foreground">{scenario.langTitle}</em> : null}</span>
            <span className="flex items-center gap-2 whitespace-nowrap text-[0.68rem] font-bold text-muted-foreground [&_svg]:text-primary">{statusLabel(scenario.progressStatus, copy)}<ArrowRight /></span>
          </button>
        ))}
      </section>

      {selected ? (
        <Modal onClose={() => setSelected(null)} labelledBy="scenario-title">
          <div className="text-center">
            <h2 className="mt-1.5 text-[2rem] tracking-[-0.05em]" id="scenario-title">{selected.title}</h2>
            {locale !== "en" ? <h3 className="mb-4 mt-1.5 text-base font-semibold text-muted-foreground">{selected.langTitle}</h3> : null}
            <p className="my-2.5 font-bold leading-6 text-foreground">{selected.description}</p>{locale !== "en" ? <p className={cn("mb-2.5 mt-1.5 text-sm leading-5", translatedClass)}>{selected.langDescription}</p> : null}
            <span className={cn(statusPillClass, selected.progressStatus === "IN_PROGRESS" && "bg-primary/10 text-primary", selected.progressStatus === "COMPLETED" && "bg-[#26734d]/10 text-[#26734d]")}>{statusLabel(selected.progressStatus, copy)}</span>
            <button className={cn(primaryActionClass, "w-full")} disabled={starting} onClick={openScenario}>{starting ? <LoaderCircle className="animate-spin" /> : null}{selected.progressStatus === "COMPLETED" ? copy.restart : selected.progressStatus === "IN_PROGRESS" ? copy.resume : copy.start}<ArrowRight /></button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function statusLabel(status: ProgressStatus, copy: ReturnType<typeof useApp>["copy"]) {
  return status === "COMPLETED" ? copy.completed : status === "IN_PROGRESS" ? copy.inProgress : copy.notStarted;
}

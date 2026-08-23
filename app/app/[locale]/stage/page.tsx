"use client";

import { ArrowRight, Check, Circle, Clock3, LoaderCircle, MapPinned } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppBackHeader as BackHeader } from "@/components/app";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { mockScenarios, stageMeta } from "@/lib/content";
import { lifeStepApi } from "@/lib/api";
import { localizePath } from "@/lib/i18n";
import { appEyebrowClass, connectionNoteClass, pageLoaderClass, primaryActionClass, subPageClass, translatedClass } from "@/components/app/app-ui-styles";
import { cn } from "@/lib/utils";
import type { JourneyType, LifeScenario, LifeStage, ProgressStatus } from "@/lib/types";
import { scenarioRowClass, stageHeroClass, stageHeroIconClass, statusPillClass } from "./styles";

export default function StagePage() {
  return <Suspense fallback={<div className={pageLoaderClass}><LoaderCircle /></div>}><StageContent /></Suspense>;
}

function StageContent() {
  const params = useSearchParams();
  const { locale, copy } = useApp();
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
    lifeStepApi.scenarios(journeyType, stage)
      .then((data) => active && setScenarios(data || []))
      .catch(() => { if (active) { setScenarios(mockScenarios(stage)); setPreview(true); } })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [journeyType, stage]);

  async function openScenario() {
    if (!selected) return;
    setStarting(true);
    if (selected.progressStatus !== "IN_PROGRESS") await lifeStepApi.startScenario(selected.id).catch(() => undefined);
    const index = scenarios.findIndex((item) => item.id === selected.id);
    const next = scenarios[index + 1];
    const query = new URLSearchParams({ id: String(selected.id), stage, journey: journeyType, title: selected.title, langTitle: selected.langTitle });
    if (next) { query.set("nextId", String(next.id)); query.set("nextTitle", next.title); query.set("nextLangTitle", next.langTitle); }
    location.assign(`${localizePath("/scenario", locale)}?${query.toString()}`);
  }

  const completed = scenarios.filter((item) => item.progressStatus === "COMPLETED").length;

  return (
    <main className={subPageClass}>
      <BackHeader title={meta.title} eyebrow={locale === "en" ? "Life stage" : meta.translated[locale]} />
      <section className={stageHeroClass}>
        <div className={stageHeroIconClass}>{meta.icon}</div>
        <div><p className={appEyebrowClass}>Stage overview</p><h2 className="my-1.5 text-[2rem] tracking-[-0.05em] max-[680px]:text-[1.45rem]">{meta.title}</h2><p className="m-0 text-muted-foreground max-[680px]:text-[0.78rem]">{locale === "en" ? meta.description : meta.translatedDescription[locale]}</p></div>
        <div className="min-w-[120px] border-l border-border p-[17px] text-center max-[680px]:col-span-full max-[680px]:flex max-[680px]:items-baseline max-[680px]:gap-2 max-[680px]:border-l-0 max-[680px]:border-t max-[680px]:px-0 max-[680px]:py-2.5 max-[680px]:text-left"><strong className="block text-[1.75rem] text-primary max-[680px]:text-xl">{completed}<span className="text-sm text-muted-foreground">/{scenarios.length || "—"}</span></strong><small className="text-[0.65rem] text-muted-foreground">scenarios complete</small></div>
      </section>
      {preview ? <div className={cn("app-content-width", connectionNoteClass)}>{copy.offline}</div> : null}

      <section className="app-content-width grid gap-2.5 pb-10 pt-2.5" aria-label="Scenarios">
        {loading ? <div className={pageLoaderClass}><LoaderCircle /><span>{copy.loading}</span></div> : scenarios.map((scenario, index) => (
          <button className={scenarioRowClass} key={scenario.id} onClick={() => setSelected(scenario)}>
            <span className={cn("grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground", scenario.progressStatus === "COMPLETED" && "bg-[#26734d]/10 text-[#26734d]", scenario.progressStatus === "IN_PROGRESS" && "bg-primary/10 text-primary")}>{scenario.progressStatus === "COMPLETED" ? <Check /> : scenario.progressStatus === "IN_PROGRESS" ? <Clock3 /> : <Circle />}</span>
            <span className="grid gap-1"><small className="text-[0.59rem] font-extrabold uppercase tracking-[0.08em] text-primary">Scenario {String(index + 1).padStart(2, "0")}</small><strong className="text-[0.96rem]">{scenario.title}</strong><em className="text-[0.72rem] not-italic text-muted-foreground">{scenario.langTitle}</em></span>
            <span className="flex items-center gap-2 text-[0.68rem] font-bold text-muted-foreground max-[680px]:col-start-2 [&_svg]:text-primary max-[680px]:[&_svg]:ml-auto">{statusLabel(scenario.progressStatus, copy)}<ArrowRight /></span>
          </button>
        ))}
      </section>

      {selected ? (
        <Modal onClose={() => setSelected(null)} labelledBy="scenario-title">
          <div className="text-center">
            <span className="mx-auto mb-[18px] grid size-[68px] place-items-center rounded-[21px] bg-[#26734d]/10 text-[#26734d] [&_svg]:size-[30px]"><MapPinned /></span>
            <p className={appEyebrowClass}>Real-life scenario</p>
            <h2 className="mt-1.5 text-[2rem] tracking-[-0.05em]" id="scenario-title">{selected.title}</h2>
            <h3 className="mb-4 mt-1.5 text-base font-semibold text-muted-foreground">{selected.langTitle}</h3>
            <p className="my-2.5 leading-6 text-muted-foreground">{selected.description}</p><p className={cn("my-2.5 leading-6", translatedClass)}>{selected.langDescription}</p>
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

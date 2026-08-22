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
import type { JourneyType, LifeScenario, LifeStage, ProgressStatus } from "@/lib/types";

export default function StagePage() {
  return <Suspense fallback={<div className="page-loader"><LoaderCircle /></div>}><StageContent /></Suspense>;
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
    <main className="app-page sub-page">
      <BackHeader title={meta.title} eyebrow={locale === "en" ? "Life stage" : meta.translated[locale]} />
      <section className="stage-hero app-content-width">
        <div className="stage-hero-icon">{meta.icon}</div>
        <div><p className="app-eyebrow">Stage overview</p><h2>{meta.title}</h2><p>{locale === "en" ? meta.description : meta.translatedDescription[locale]}</p></div>
        <div className="stage-count"><strong>{completed}<span>/{scenarios.length || "—"}</span></strong><small>scenarios complete</small></div>
      </section>
      {preview ? <div className="connection-note app-content-width">{copy.offline}</div> : null}

      <section className="scenario-list app-content-width" aria-label="Scenarios">
        {loading ? <div className="page-loader"><LoaderCircle /><span>{copy.loading}</span></div> : scenarios.map((scenario, index) => (
          <button className={`scenario-row status-${scenario.progressStatus.toLowerCase().replace("_", "-")}`} key={scenario.id} onClick={() => setSelected(scenario)}>
            <span className="scenario-index">{scenario.progressStatus === "COMPLETED" ? <Check /> : scenario.progressStatus === "IN_PROGRESS" ? <Clock3 /> : <Circle />}</span>
            <span className="scenario-copy"><small>Scenario {String(index + 1).padStart(2, "0")}</small><strong>{scenario.title}</strong><em>{scenario.langTitle}</em></span>
            <span className="scenario-status">{statusLabel(scenario.progressStatus, copy)}<ArrowRight /></span>
          </button>
        ))}
      </section>

      {selected ? (
        <Modal onClose={() => setSelected(null)} labelledBy="scenario-title">
          <div className="scenario-modal">
            <span className="scenario-modal-icon"><MapPinned /></span>
            <p className="app-eyebrow">Real-life scenario</p>
            <h2 id="scenario-title">{selected.title}</h2>
            <h3>{selected.langTitle}</h3>
            <p>{selected.description}</p><p className="translated">{selected.langDescription}</p>
            <span className={`status-pill status-${selected.progressStatus.toLowerCase().replace("_", "-")}`}>{statusLabel(selected.progressStatus, copy)}</span>
            <button className="button" disabled={starting} onClick={openScenario}>{starting ? <LoaderCircle className="spin" /> : null}{selected.progressStatus === "COMPLETED" ? copy.restart : selected.progressStatus === "IN_PROGRESS" ? copy.resume : copy.start}<ArrowRight /></button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function statusLabel(status: ProgressStatus, copy: ReturnType<typeof useApp>["copy"]) {
  return status === "COMPLETED" ? copy.completed : status === "IN_PROGRESS" ? copy.inProgress : copy.notStarted;
}

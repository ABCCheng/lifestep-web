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
import type { JourneyStageProgress, JourneyType, LifeStage, ProgressStatus } from "@/lib/types";

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
    <main className="app-page journey-page">
      <DesktopAppHeader />
      <section className="journey-intro app-shell-width">
        <div><p className="app-eyebrow">{journeyType ? `${choices.find((item) => item.type === journeyType)?.title} journey` : "Your Canadian journey"}</p><h1>{copy.journey}</h1><p>Each stop prepares you for a moment that matters.</p></div>
        <button className="journey-switch" onClick={() => setNeedsChoice(true)}><RotateCcw /> Change path</button>
      </section>

      {preview ? <div className="connection-note app-shell-width">{copy.offline}</div> : null}

      <section className="journey-map app-shell-width" aria-label="Life stages map">
        <span className="map-river river-one" /><span className="map-river river-two" />
        <span className="map-cloud map-cloud-one" /><span className="map-cloud map-cloud-two" />
        <div className="map-mountains"><span /><span /><span /></div>
        <div className="route-spine" />
        {loading ? <div className="map-loading"><LoaderCircle /><span>{copy.loading}</span></div> : null}
        <div className="journey-stops">
          {stages.map((stage, index) => {
            const value = progressMap.get(stage) ?? (preview ? (index < 2 ? 100 : index === 2 ? 35 : 0) : 0);
            const status: ProgressStatus = value >= 100 ? "COMPLETED" : value > 0 ? "IN_PROGRESS" : "NOT_STARTED";
            const meta = stageMeta[stage];
            return (
              <div className={`journey-stop-row row-${index % 4}`} key={stage}>
                <button className={`journey-stop ${status.toLowerCase().replace("_", "-")} ${current === stage ? "is-current" : ""}`} onClick={() => setSelected(stage)} aria-label={`${meta.title}, ${value}%`}>
                  <span className="stop-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="stop-icon">{status === "COMPLETED" ? <Check /> : meta.icon}</span>
                  <span className="stop-copy"><strong>{meta.title}</strong><small>{meta.translated[locale] ?? meta.title}</small></span>
                  {current === stage ? <span className="you-are-here"><MapPin /> You are here</span> : null}
                </button>
              </div>
            );
          })}
        </div>
        <div className="map-finish"><span>🍁</span><strong>Your new life,<br />one step closer.</strong></div>
      </section>

      {needsChoice ? (
        <Modal onClose={() => journeyType && setNeedsChoice(false)} labelledBy="journey-question" locked={!journeyType}>
          <div className="choice-modal">
            <span className="choice-kicker">Let&apos;s make this yours</span>
            <h2 id="journey-question">What brings you to Canada?</h2>
            <p>Choose the path that fits you best. You can change it later.</p>
            <div className="journey-choices">
              {choices.map((choice) => <button key={choice.type} onClick={() => choose(choice.type)}><span>{choice.icon}</span><div><strong>{choice.title}</strong><small>{choice.body}</small></div><ArrowRight /></button>)}
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
      <div className="stage-modal">
        <div className="stage-modal-icon">{meta.icon}</div>
        <p className="app-eyebrow">Life stage</p>
        <h2 id="stage-modal-title">{meta.title}</h2>
        {locale !== "en" ? <h3>{meta.translated[locale] ?? meta.title}</h3> : null}
        <p>{meta.description}</p>
        {locale !== "en" ? <p className="translated">{meta.translatedDescription[locale] ?? meta.description}</p> : null}
        <div className="progress-label"><span>{copy.progress}</span><strong>{progress}%</strong></div>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <Link className="button" href={`${localizePath("/stage", locale)}?stage=${stage}&journey=${journeyType}`}>{button}<ArrowRight /></Link>
      </div>
    </Modal>
  );
}

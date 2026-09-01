"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getApiErrorMessage, lifeStepApi } from "@/lib/api";
import { journeyOrders } from "@/lib/content";
import { useLocaleContext } from "./locale-provider";
import { deleteOfflineRecord, offlineKeys, readOfflineRecord, writeOfflineRecord } from "@/lib/stores/lifestep-offline";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";
import { getStoredJourneyType } from "@/lib/stores/journey";
import type { JourneyData, JourneyType, LifeScenario, LifeScenarioData, LifeStage, PracticeProgressMap, ProgressStatus, ScenarioDetail, ScenarioProgressMap, ScenarioVocabularyInfo } from "@/lib/types";

type CachedJourney = { locale: string; journeyType: JourneyType; data: JourneyData };
type CachedLocalized<T> = { locale: string; data: T };

function isCompleteJourneyData(data: JourneyData | null | undefined) {
  return Boolean(data && journeyOrders.STUDY.every((stage) => Array.isArray(data[stage])));
}

function statusFor(progress: ScenarioProgressMap, id: number): ProgressStatus {
  return progress[String(id)] || "NOT_STARTED";
}

function withProgress(item: LifeScenarioData, progress: ScenarioProgressMap): LifeScenario {
  return { id: item.id, title: item.title, langTitle: item.langTitle, description: item.description, langDescription: item.langDescription, progressStatus: statusFor(progress, item.id) };
}

type LifeStepDataContextValue = {
  ready: boolean;
  journeyReady: boolean;
  practiceReady: boolean;
  loading: boolean;
  ensureJourneyData: (journeyType: JourneyType, force?: boolean) => Promise<JourneyData | null>;
  refreshJourneyData: (journeyType: JourneyType) => Promise<boolean>;
  getScenarios: (journeyType: JourneyType, stage: LifeStage) => LifeScenario[];
  getScenarioDetail: (journeyType: JourneyType, scenarioId: number) => ScenarioDetail | null;
  getStageProgress: (journeyType: JourneyType, stage: LifeStage) => number;
  markScenarioStarted: (journeyType: JourneyType, scenarioId: number) => void;
  markScenarioCompleted: (journeyType: JourneyType, scenarioId: number) => void;
  vocabulary: ScenarioVocabularyInfo[];
  refreshVocabulary: () => Promise<boolean>;
  vocabularyProgress: PracticeProgressMap;
  markVocabularyPractised: (id: number) => void;
  markVocabularyUnpractised: (id: number) => void;
  markVocabularySkipped: (id: number) => void;
  keyPhrases: string[];
  refreshKeyPhrases: () => Promise<boolean>;
  sentenceProgress: PracticeProgressMap;
  markSentencePractised: (phrase: string) => void;
  markSentenceUnpractised: (phrase: string) => void;
  markSentenceSkipped: (phrase: string) => void;
};

const LifeStepDataContext = createContext<LifeStepDataContextValue | null>(null);

export function LifeStepDataProvider({ children }: { children: ReactNode }) {
  const { locale, dictionary } = useLocaleContext();
  const notifyApiError = useCallback((error: unknown) => {
    showGlobalSnackbar(getApiErrorMessage(error, dictionary.network));
  }, [dictionary.network]);
  const [journey, setJourneyState] = useState<JourneyData | null>(null);
  const [journeyTypeInMemory, setJourneyTypeInMemory] = useState<JourneyType | null>(null);
  const [scenarioProgress, setScenarioProgress] = useState<ScenarioProgressMap>({});
  const [vocabulary, setVocabulary] = useState<ScenarioVocabularyInfo[]>([]);
  const [keyPhrases, setKeyPhrases] = useState<string[]>([]);
  const [vocabularyProgress, setVocabularyProgress] = useState<PracticeProgressMap>({});
  const [sentenceProgress, setSentenceProgress] = useState<PracticeProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [journeyReady, setJourneyReady] = useState(false);
  const [practiceReady, setPracticeReady] = useState(false);
  const journeyRef = useRef<CachedJourney | null>(null);
  const vocabularyRef = useRef<CachedLocalized<ScenarioVocabularyInfo[]> | null>(null);
  const keyPhrasesRef = useRef<CachedLocalized<string[]> | null>(null);

  const setJourney = useCallback((journeyType: JourneyType, data: JourneyData) => {
    const cached = { locale, journeyType, data };
    journeyRef.current = cached;
    setJourneyTypeInMemory(journeyType);
    setJourneyState(data);
  }, [locale]);

  const ensureJourneyData = useCallback(async (journeyType: JourneyType, force = false) => {
    const inMemory = journeyRef.current?.locale === locale && journeyRef.current.journeyType === journeyType ? journeyRef.current.data : null;
    const stored = inMemory ? null : await readOfflineRecord<CachedJourney>(offlineKeys.journey);
    const cached = isCompleteJourneyData(inMemory)
      ? inMemory
      : stored?.locale === locale && stored.journeyType === journeyType && isCompleteJourneyData(stored.data)
        ? stored.data
        : null;
    // Avoid publishing the same in-memory object on every caller invocation.
    // Doing so changes selector references and can make page effects restart
    // while they are still handling the previous load.
    if (cached && cached !== inMemory) setJourney(journeyType, cached);
    if (!force && cached && isCompleteJourneyData(cached)) return cached;
    try {
      const data = await lifeStepApi.journeyData(journeyType);
      if (!isCompleteJourneyData(data)) throw new Error("Incomplete journey data");
      await writeOfflineRecord(offlineKeys.journey, { locale, journeyType, data } satisfies CachedJourney);
      setJourney(journeyType, data);
      return data;
    } catch (error) {
      if (force || !cached) notifyApiError(error);
      return cached && isCompleteJourneyData(cached) ? cached : null;
    }
  }, [locale, notifyApiError, setJourney]);

  const loadVocabulary = useCallback(async (force = false) => {
    const inMemory = vocabularyRef.current?.locale === locale ? vocabularyRef.current.data : null;
    const stored = inMemory ? null : await readOfflineRecord<CachedLocalized<ScenarioVocabularyInfo[]>>(offlineKeys.vocabulary);
    const cached = Array.isArray(inMemory)
      ? inMemory
      : stored?.locale === locale && Array.isArray(stored.data)
        ? stored.data
        : null;
    if (cached) {
      vocabularyRef.current = { locale, data: cached };
      setVocabulary(cached);
    }
    if (!force && cached) return cached;
    try {
      const data = await lifeStepApi.vocabulary();
      if (!Array.isArray(data)) throw new Error("Invalid vocabulary data");
      await writeOfflineRecord(offlineKeys.vocabulary, { locale, data } satisfies CachedLocalized<ScenarioVocabularyInfo[]>);
      vocabularyRef.current = { locale, data };
      setVocabulary(data);
      return data;
    } catch (error) {
      if (force || !cached) notifyApiError(error);
      return cached || null;
    }
  }, [locale, notifyApiError]);

  const loadKeyPhrases = useCallback(async (force = false) => {
    const inMemory = keyPhrasesRef.current?.locale === locale ? keyPhrasesRef.current.data : null;
    const stored = inMemory ? null : await readOfflineRecord<CachedLocalized<string[]>>(offlineKeys.keyPhrases);
    const cached = Array.isArray(inMemory)
      ? inMemory
      : stored?.locale === locale && Array.isArray(stored.data)
        ? stored.data
        : null;
    if (cached) {
      keyPhrasesRef.current = { locale, data: cached };
      setKeyPhrases(cached);
    }
    if (!force && cached) return cached;
    try {
      const data = await lifeStepApi.keyPhrases();
      if (!Array.isArray(data)) throw new Error("Invalid key phrase data");
      await writeOfflineRecord(offlineKeys.keyPhrases, { locale, data } satisfies CachedLocalized<string[]>);
      keyPhrasesRef.current = { locale, data };
      setKeyPhrases(data);
      return data;
    } catch (error) {
      if (force || !cached) notifyApiError(error);
      return cached || null;
    }
  }, [locale, notifyApiError]);

  const loadProgress = useCallback(async (reset = false) => {
    if (reset) {
      await Promise.all([
        deleteOfflineRecord(offlineKeys.scenarioProgress),
        deleteOfflineRecord(offlineKeys.vocabularyProgress),
        deleteOfflineRecord(offlineKeys.sentenceProgress),
      ]);
      setScenarioProgress({});
      setVocabularyProgress({});
      setSentenceProgress({});
      return;
    }
    const [scenario, words, sentences] = await Promise.all([
      readOfflineRecord<ScenarioProgressMap>(offlineKeys.scenarioProgress),
      readOfflineRecord<PracticeProgressMap>(offlineKeys.vocabularyProgress),
      readOfflineRecord<PracticeProgressMap>(offlineKeys.sentenceProgress),
    ]);
    setScenarioProgress(scenario || {});
    setVocabularyProgress(words || {});
    setSentenceProgress(sentences || {});
  }, []);

  useEffect(() => {
    let active = true;
    journeyRef.current = null;
    vocabularyRef.current = null;
    keyPhrasesRef.current = null;
    setJourneyState(null);
    setJourneyTypeInMemory(null);
    setVocabulary([]);
    setKeyPhrases([]);
    setScenarioProgress({});
    setVocabularyProgress({});
    setSentenceProgress({});
    setLoading(true);
    setReady(false);
    setJourneyReady(false);
    setPracticeReady(false);
    const initialJourney = getStoredJourneyType() || "STUDY";
    const forceLocaleReload = typeof window !== "undefined" && localStorage.getItem("lifestep-reload-locale") === locale;
    if (forceLocaleReload) localStorage.removeItem("lifestep-reload-locale");
    const journeyLoad = Promise.all([ensureJourneyData(initialJourney, forceLocaleReload), loadProgress(forceLocaleReload)]).finally(() => {
      if (active) setJourneyReady(true);
    });
    const practiceLoad = Promise.all([loadVocabulary(forceLocaleReload), loadKeyPhrases(forceLocaleReload)]).finally(() => {
      if (active) setPracticeReady(true);
    });
    void Promise.all([journeyLoad, practiceLoad]).finally(() => {
      if (active) { setLoading(false); setReady(true); }
    });
    return () => { active = false; };
  }, [ensureJourneyData, loadKeyPhrases, loadProgress, loadVocabulary, locale]);

  const refreshJourneyData = useCallback(async (journeyType: JourneyType) => {
    try {
      const data = await lifeStepApi.journeyData(journeyType);
      if (!isCompleteJourneyData(data)) {
        notifyApiError(new Error("Incomplete journey data"));
        return false;
      }
      await writeOfflineRecord(offlineKeys.journey, { locale, journeyType, data } satisfies CachedJourney);
      setJourney(journeyType, data);
      setScenarioProgress({});
      await deleteOfflineRecord(offlineKeys.scenarioProgress);
      return true;
    } catch (error) {
      notifyApiError(error);
      return false;
    }
  }, [locale, notifyApiError, setJourney]);

  const getProgress = useCallback((journeyType: JourneyType) => journeyTypeInMemory === journeyType ? scenarioProgress : {}, [journeyTypeInMemory, scenarioProgress]);
  const getScenarios = useCallback((journeyType: JourneyType, stage: LifeStage) => (journeyTypeInMemory === journeyType ? journey?.[stage] || [] : []).map((item) => withProgress(item, getProgress(journeyType))), [getProgress, journey, journeyTypeInMemory]);
  const getScenarioDetail = useCallback((journeyType: JourneyType, scenarioId: number) => {
    const item = journeyTypeInMemory === journeyType ? Object.values(journey || {}).flat().find((scenario) => scenario.id === scenarioId) : undefined;
    if (!item) return null;
    return { scenarioId: item.id, knowledgeList: item.knowledgeList, vocabularyList: item.vocabularyList, conversationList: item.conversationList, review: item.review || { summary: "", keyPhrases: [], takeaway: "" } };
  }, [journey, journeyTypeInMemory]);
  const getStageProgress = useCallback((journeyType: JourneyType, stage: LifeStage) => {
    const scenarios = journeyTypeInMemory === journeyType ? journey?.[stage] || [] : [];
    if (!scenarios.length) return 0;
    const progress = getProgress(journeyType);
    const completed = scenarios.filter((item) => statusFor(progress, item.id) === "COMPLETED").length;
    const started = scenarios.some((item) => statusFor(progress, item.id) === "IN_PROGRESS");
    return Math.min(100, Math.max(started && completed === 0 ? 1 : 0, Math.round((completed / scenarios.length) * 100)));
  }, [getProgress, journey, journeyTypeInMemory]);

  const updateScenario = useCallback((journeyType: JourneyType, scenarioId: number, status: ProgressStatus) => {
    if (journeyTypeInMemory !== journeyType) return;
    setScenarioProgress((current) => {
      const next = { ...current, [String(scenarioId)]: status };
      void writeOfflineRecord(offlineKeys.scenarioProgress, next);
      return next;
    });
  }, [journeyTypeInMemory]);

  const markVocabularyPractised = useCallback((id: number) => {
    setVocabularyProgress((current) => {
      const next = { ...current, [String(id)]: "KNOWN" as const };
      void writeOfflineRecord(offlineKeys.vocabularyProgress, next);
      return next;
    });
  }, []);
  const markVocabularyUnpractised = useCallback((id: number) => {
    setVocabularyProgress((current) => {
      const next = { ...current, [String(id)]: "NOT_KNOWN" as const };
      void writeOfflineRecord(offlineKeys.vocabularyProgress, next);
      return next;
    });
  }, []);
  const markVocabularySkipped = useCallback((id: number) => {
    setVocabularyProgress((current) => {
      const next = { ...current, [String(id)]: "SKIPPED" as const };
      void writeOfflineRecord(offlineKeys.vocabularyProgress, next);
      return next;
    });
  }, []);
  const markSentencePractised = useCallback((phrase: string) => {
    setSentenceProgress((current) => {
      const next = { ...current, [phrase]: "KNOWN" as const };
      void writeOfflineRecord(offlineKeys.sentenceProgress, next);
      return next;
    });
  }, []);
  const markSentenceUnpractised = useCallback((phrase: string) => {
    setSentenceProgress((current) => {
      const next = { ...current, [phrase]: "NOT_KNOWN" as const };
      void writeOfflineRecord(offlineKeys.sentenceProgress, next);
      return next;
    });
  }, []);
  const markSentenceSkipped = useCallback((phrase: string) => {
    setSentenceProgress((current) => {
      const next = { ...current, [phrase]: "SKIPPED" as const };
      void writeOfflineRecord(offlineKeys.sentenceProgress, next);
      return next;
    });
  }, []);

  const refreshVocabulary = useCallback(async () => {
    try {
      const data = await lifeStepApi.vocabulary();
      if (!Array.isArray(data)) {
        notifyApiError(new Error("Invalid vocabulary data"));
        return false;
      }
      await writeOfflineRecord(offlineKeys.vocabulary, { locale, data } satisfies CachedLocalized<ScenarioVocabularyInfo[]>);
      vocabularyRef.current = { locale, data };
      setVocabulary(data);
      setVocabularyProgress({});
      await deleteOfflineRecord(offlineKeys.vocabularyProgress);
      return true;
    } catch (error) {
      notifyApiError(error);
      return false;
    }
  }, [locale, notifyApiError]);
  const refreshKeyPhrases = useCallback(async () => {
    try {
      const data = await lifeStepApi.keyPhrases();
      if (!Array.isArray(data)) {
        notifyApiError(new Error("Invalid key phrase data"));
        return false;
      }
      await writeOfflineRecord(offlineKeys.keyPhrases, { locale, data } satisfies CachedLocalized<string[]>);
      keyPhrasesRef.current = { locale, data };
      setKeyPhrases(data);
      setSentenceProgress({});
      await deleteOfflineRecord(offlineKeys.sentenceProgress);
      return true;
    } catch (error) {
      notifyApiError(error);
      return false;
    }
  }, [locale, notifyApiError]);

  const value = useMemo<LifeStepDataContextValue>(() => ({
    ready, journeyReady, practiceReady, loading, ensureJourneyData, refreshJourneyData, getScenarios, getScenarioDetail, getStageProgress,
    markScenarioStarted: (journeyType, scenarioId) => updateScenario(journeyType, scenarioId, "IN_PROGRESS"),
    markScenarioCompleted: (journeyType, scenarioId) => updateScenario(journeyType, scenarioId, "COMPLETED"),
    vocabulary, refreshVocabulary, vocabularyProgress, markVocabularyPractised, markVocabularyUnpractised, markVocabularySkipped, keyPhrases, refreshKeyPhrases, sentenceProgress, markSentencePractised, markSentenceUnpractised, markSentenceSkipped,
  }), [ensureJourneyData, getScenarioDetail, getScenarios, getStageProgress, journeyReady, keyPhrases, loading, markSentencePractised, markSentenceSkipped, markSentenceUnpractised, markVocabularyPractised, markVocabularySkipped, markVocabularyUnpractised, practiceReady, ready, refreshKeyPhrases, refreshJourneyData, refreshVocabulary, sentenceProgress, updateScenario, vocabulary, vocabularyProgress]);
  return <LifeStepDataContext.Provider value={value}>{children}</LifeStepDataContext.Provider>;
}

export function useLifeStepData() {
  const value = useContext(LifeStepDataContext);
  if (!value) throw new Error("useLifeStepData must be used within LifeStepDataProvider");
  return value;
}

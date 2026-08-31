export type JourneyType = "STUDY" | "WORK" | "FAMILY";
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type PracticeStatus = "NOT_KNOWN" | "SKIPPED" | "KNOWN";

export type LifeStage =
  | "ARRIVE"
  | "GET_SETTLED"
  | "HOUSING"
  | "FINANCES"
  | "LIFE_SETUP"
  | "TRANSPORTATION"
  | "HEALTHCARE"
  | "SCHOOL_CHILDCARE"
  | "EVERYDAY_LIFE"
  | "FIND_JOB"
  | "WORK_GROW"
  | "COMMUNITY";

export type JourneyStageProgress = { lifeStage: LifeStage; progress: number };
export type LifeScenario = {
  id: number;
  title: string;
  langTitle: string;
  description: string;
  langDescription: string;
  progressStatus: ProgressStatus;
};
export type ScenarioDetail = {
  scenarioId: number;
  knowledgeList: Array<{ id: number; title: string; langTitle: string; content: string; langContent: string }>;
  vocabularyList: Array<{ id: number; term: string; langTerm: string; pronunciation: string }>;
  conversationList: Array<{ id: number; speaker: string; message: string; langMessage: string }>;
  review: { summary: string; keyPhrases: string[]; takeaway: string };
};

export type ScenarioVocabularyInfo = {
  id: number;
  scenarioId?: number;
  term: string;
  langTerm: string;
  pronunciation: string;
};

export type LifeScenarioData = Omit<LifeScenario, "progressStatus"> & {
  lifeStage: LifeStage;
  knowledgeList: ScenarioDetail["knowledgeList"];
  vocabularyList: ScenarioVocabularyInfo[];
  conversationList: ScenarioDetail["conversationList"];
  review: ScenarioDetail["review"] | null;
};

export type JourneyData = Partial<Record<LifeStage, LifeScenarioData[]>>;
export type ScenarioProgressMap = Record<string, ProgressStatus>;
export type PracticeProgressMap = Record<string, PracticeStatus>;

export type ApiResponse<T> = { code: number; message: string; data: T };

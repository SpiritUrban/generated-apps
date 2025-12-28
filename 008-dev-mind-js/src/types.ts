export type Difficulty = "easy" | "medium" | "hard";

export type UserState = {
  focus: number;
  fatigue: number;
  tension: number;
};

export type DevMindEvaluation = {
  items: number;
  keywords: number;
};

export type DevMindNote = {
  text: string;
  lastUpdated: number;
  evaluation: DevMindEvaluation;
};

export type Progress = {
  completedLessons: string[];
  completedChallenges: string[];
  attemptsByChallenge: Record<string, number>;
  userState: UserState;
  devMindNotes: Record<string, DevMindNote>;
};

export type Lesson = {
  id: string;
  title: string;
  text: string;
  rule: string;
  prompt: string;
  difficulty: Difficulty;
};

export type Contract = {
  name: string;
  signature: string;
  examples: string[];
};

export type TestCase = {
  input: unknown[];
  expected: unknown;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  contract: Contract;
  starterCode: string;
  tests: TestCase[];
  hint: string;
  solution: string;
  difficulty: Difficulty;
};

export type DevMindExercise = {
  id: string;
  title: string;
  prompt: string;
  checklist: string[];
  keywords: string[];
  minItems: number;
};

export type View = "dashboard" | "lesson" | "challenge" | "devmind";

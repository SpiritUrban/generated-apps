import type { Challenge, Lesson, TestCase, UserState } from "../types";

export type Adaptation = {
  shortLesson: boolean;
  suggestNoCode: boolean;
  testsLimit: number;
  focusBand: "low" | "mid" | "high";
};

export function getAdaptation(state: UserState): Adaptation {
  const highStress = state.fatigue >= 4 || state.tension >= 4;
  const focusBand = state.focus <= 2 ? "low" : state.focus >= 4 ? "high" : "mid";
  const testsLimit = highStress ? 4 : focusBand === "high" && state.fatigue <= 2 ? 8 : 6;
  return {
    shortLesson: highStress,
    suggestNoCode: highStress,
    testsLimit,
    focusBand
  };
}

export function selectTests(tests: TestCase[], adaptation: Adaptation): TestCase[] {
  return tests.slice(0, Math.min(adaptation.testsLimit, tests.length));
}

export function getNextLesson(lessons: Lesson[], completed: string[]): Lesson | undefined {
  return lessons.find((lesson) => !completed.includes(lesson.id));
}

export function getNextChallenge(challenges: Challenge[], completed: string[]): Challenge | undefined {
  return challenges.find((challenge) => !completed.includes(challenge.id));
}

export function pickLessonByDifficulty(
  lessons: Lesson[],
  completed: string[],
  difficulty: Lesson["difficulty"]
): Lesson | undefined {
  return lessons.find((lesson) => lesson.difficulty === difficulty && !completed.includes(lesson.id));
}

export function pickChallengeByDifficulty(
  challenges: Challenge[],
  completed: string[],
  difficulty: Challenge["difficulty"]
): Challenge | undefined {
  return challenges.find(
    (challenge) => challenge.difficulty === difficulty && !completed.includes(challenge.id)
  );
}

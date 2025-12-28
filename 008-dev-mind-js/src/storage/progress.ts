import type { Progress } from "../types";

const STORAGE_KEY = "dev-mind-js-progress";

export const defaultProgress: Progress = {
  completedLessons: [],
  completedChallenges: [],
  attemptsByChallenge: {},
  userState: {
    focus: 3,
    fatigue: 2,
    tension: 2
  },
  devMindNotes: {}
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      ...defaultProgress,
      ...parsed,
      userState: {
        ...defaultProgress.userState,
        ...(parsed.userState ?? {})
      },
      attemptsByChallenge: parsed.attemptsByChallenge ?? {},
      completedLessons: parsed.completedLessons ?? [],
      completedChallenges: parsed.completedChallenges ?? [],
      devMindNotes: parsed.devMindNotes ?? {}
    };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

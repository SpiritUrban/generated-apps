import { useEffect, useMemo, useState } from "react";
import { lessons } from "./content/lessons";
import { challenges } from "./content/challenges";
import { devMindExercises } from "./content/devMind";
import { loadProgress, saveProgress } from "./storage/progress";
import { Dashboard } from "./components/Dashboard";
import { LessonView } from "./components/LessonView";
import { ChallengeView } from "./components/ChallengeView";
import { DevMindView } from "./components/DevMindView";
import { TopNav } from "./components/TopNav";
import {
  getAdaptation,
  getNextChallenge,
  getNextLesson,
  pickChallengeByDifficulty,
  pickLessonByDifficulty
} from "./utils/adaptation";
import type { Challenge, DevMindNote, Lesson, Progress, UserState, View } from "./types";

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [view, setView] = useState<View>("dashboard");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [activeDevMindId, setActiveDevMindId] = useState<string | null>(devMindExercises[0]?.id ?? null);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const adaptation = useMemo(() => getAdaptation(progress.userState), [progress.userState]);

  const currentLesson = useMemo<Lesson>(() => {
    const found = lessons.find((lesson) => lesson.id === activeLessonId);
    if (found) return found;
    const next = getNextLesson(lessons, progress.completedLessons);
    return next ?? lessons[0];
  }, [activeLessonId, progress.completedLessons]);

  const currentChallenge = useMemo<Challenge>(() => {
    const found = challenges.find((challenge) => challenge.id === activeChallengeId);
    if (found) return found;
    const next = getNextChallenge(challenges, progress.completedChallenges);
    return next ?? challenges[0];
  }, [activeChallengeId, progress.completedChallenges]);

  const currentDevMind = useMemo(() => {
    const found = devMindExercises.find((exercise) => exercise.id === activeDevMindId);
    return found ?? devMindExercises[0];
  }, [activeDevMindId]);

  const gotoLesson = (lesson?: Lesson) => {
    const target = lesson ?? getNextLesson(lessons, progress.completedLessons) ?? lessons[0];
    setActiveLessonId(target.id);
    setView("lesson");
  };

  const gotoChallenge = (challenge?: Challenge) => {
    const target = challenge ?? getNextChallenge(challenges, progress.completedChallenges) ?? challenges[0];
    setActiveChallengeId(target.id);
    setView("challenge");
  };

  const gotoDevMind = (exerciseId?: string) => {
    setActiveDevMindId(exerciseId ?? devMindExercises[0]?.id ?? null);
    setView("devmind");
  };

  const handleSaveState = (userState: UserState) => {
    setProgress((prev) => ({ ...prev, userState }));
  };

  const markLessonComplete = (id: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(id)) return prev;
      return { ...prev, completedLessons: [...prev.completedLessons, id] };
    });
  };

  const markChallengeComplete = (id: string) => {
    setProgress((prev) => {
      if (prev.completedChallenges.includes(id)) return prev;
      return { ...prev, completedChallenges: [...prev.completedChallenges, id] };
    });
  };

  const registerAttempt = (id: string) => {
    setProgress((prev) => ({
      ...prev,
      attemptsByChallenge: {
        ...prev.attemptsByChallenge,
        [id]: (prev.attemptsByChallenge[id] ?? 0) + 1
      }
    }));
  };

  const saveDevMindNote = (id: string, note: DevMindNote) => {
    setProgress((prev) => ({
      ...prev,
      devMindNotes: {
        ...prev.devMindNotes,
        [id]: note
      }
    }));
  };

  const attemptsForCurrent = progress.attemptsByChallenge[currentChallenge.id] ?? 0;

  const continueTarget = (() => {
    if (adaptation.suggestNoCode) {
      return {
        label: "DevMind",
        detail: "Бережный режим: без кода.",
        action: () => gotoDevMind()
      };
    }

    if (adaptation.focusBand === "low") {
      const easyLesson = pickLessonByDifficulty(lessons, progress.completedLessons, "easy");
      return {
        label: "Легкий урок",
        detail: "Короткий разогрев, чтобы вернуть фокус.",
        action: () => gotoLesson(easyLesson)
      };
    }

    if (adaptation.focusBand === "high" && progress.userState.fatigue <= 2) {
      const hardChallenge = pickChallengeByDifficulty(challenges, progress.completedChallenges, "hard");
      return {
        label: "Сложнее",
        detail: "Фокус высокий — можно усложнить.",
        action: () => gotoChallenge(hardChallenge)
      };
    }

    const nextChallenge = getNextChallenge(challenges, progress.completedChallenges);
    return {
      label: "Челлендж",
      detail: "Небольшая задача для практики.",
      action: () => gotoChallenge(nextChallenge ?? challenges[0])
    };
  })();

  return (
    <div className="app">
      <TopNav view={view} onNavigate={setView} userState={progress.userState} onSaveState={handleSaveState} />
      <main className="content">
        {view === "dashboard" && (
          <Dashboard
            completedLessons={progress.completedLessons.length}
            completedChallenges={progress.completedChallenges.length}
            totalLessons={lessons.length}
            totalChallenges={challenges.length}
            recommendation={continueTarget}
            onStartLesson={() => gotoLesson()}
            onStartChallenge={() => gotoChallenge()}
            onStartDevMind={() => gotoDevMind()}
          />
        )}

        {view === "lesson" && currentLesson && (
          <LessonView
            lesson={currentLesson}
            isCompleted={progress.completedLessons.includes(currentLesson.id)}
            shortMode={adaptation.shortLesson}
            onGotIt={() => {
              markLessonComplete(currentLesson.id);
              setView("dashboard");
            }}
            onLater={() => setView("dashboard")}
          />
        )}

        {view === "challenge" && currentChallenge && (
          <ChallengeView
            challenge={currentChallenge}
            attempts={attemptsForCurrent}
            adaptation={adaptation}
            onComplete={() => {
              markChallengeComplete(currentChallenge.id);
              setView("dashboard");
            }}
            onAttempt={() => registerAttempt(currentChallenge.id)}
          />
        )}

        {view === "devmind" && currentDevMind && (
          <DevMindView
            exercise={currentDevMind}
            notes={progress.devMindNotes}
            onSelectExercise={setActiveDevMindId}
            onSaveNote={saveDevMindNote}
          />
        )}
      </main>
    </div>
  );
}

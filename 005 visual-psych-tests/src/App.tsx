import { useEffect, useMemo, useState } from "react";
import PlaneTest from "./components/PlaneTest";
import MovingObjectsTest from "./components/MovingObjectsTest";
import DragComfortTest from "./components/DragComfortTest";
import ResultView from "./components/ResultView";
import type { StoredResults, TestId, TestResult } from "./types";

const STORAGE_KEY = "visual-tests-profile-v1";

type Screen = "home" | "test" | "result";

type TestCard = {
  id: TestId;
  title: string;
  description: string;
};

const TESTS: TestCard[] = [
  {
    id: "plane",
    title: "Контроль ↔ Свобода",
    description: "Выбери точку на плоскости.",
  },
  {
    id: "moving",
    title: "Следование за объектом",
    description: "Кликни, за кем хочется следить.",
  },
  {
    id: "drag",
    title: "Зона комфорта",
    description: "Перемести маркер в удобную область.",
  },
];

const loadResults = (): StoredResults => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredResults;
  } catch {
    return {};
  }
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTest, setActiveTest] = useState<TestId | null>(null);
  const [results, setResults] = useState<StoredResults>(() => loadResults());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }, [results]);

  const completedCount = useMemo(
    () => TESTS.filter((test) => results[test.id]).length,
    [results]
  );

  const startTest = (id: TestId) => {
    setActiveTest(id);
    setScreen("test");
  };

  const handleComplete = (result: TestResult) => {
    setResults((prev) => ({ ...prev, [result.id]: result }));
    setActiveTest(null);
    setScreen("result");
  };

  const handleExit = () => {
    setActiveTest(null);
    setScreen("home");
  };

  const handleReset = () => {
    setResults({});
    setScreen("home");
  };

  return (
    <div className="app">
      {screen === "home" && (
        <div className="home">
          <header className="hero">
            <div className="badge">визуальные тесты</div>
            <h1>Исследуй свое состояние через движение.</h1>
            <p>
              Без вопросов и оценок. Только ощущения, жесты и пространство.
            </p>
          </header>
          <section className="grid">
            {TESTS.map((test) => (
              <button
                key={test.id}
                className="card"
                onClick={() => startTest(test.id)}
              >
                <div className="card-title">{test.title}</div>
                <div className="card-desc">{test.description}</div>
                <div className="card-status">
                  {results[test.id] ? "готово" : "не пройдено"}
                </div>
              </button>
            ))}
          </section>
          <footer className="footer">
            <div>{`Пройдено: ${completedCount} / ${TESTS.length}`}</div>
            <div className="footer-actions">
              <button
                className="primary"
                onClick={() => setScreen("result")}
                disabled={completedCount === 0}
              >
                Профиль
              </button>
              <button className="ghost" onClick={handleReset}>
                Сбросить
              </button>
            </div>
          </footer>
        </div>
      )}

      {screen === "test" && activeTest === "plane" && (
        <PlaneTest onComplete={handleComplete} onExit={handleExit} />
      )}
      {screen === "test" && activeTest === "moving" && (
        <MovingObjectsTest onComplete={handleComplete} onExit={handleExit} />
      )}
      {screen === "test" && activeTest === "drag" && (
        <DragComfortTest onComplete={handleComplete} onExit={handleExit} />
      )}

      {screen === "result" && (
        <ResultView
          results={results}
          onRestartTest={(id) => startTest(id)}
          onBackHome={() => setScreen("home")}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

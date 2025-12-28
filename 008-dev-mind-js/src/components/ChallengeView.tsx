import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import type { Challenge } from "../types";
import type { Adaptation } from "../utils/adaptation";
import { selectTests } from "../utils/adaptation";
import { runTests } from "../utils/testRunner";

const defaultMessage = "Запусти тесты, чтобы проверить решение.";

type ChallengeViewProps = {
  challenge: Challenge;
  attempts: number;
  adaptation: Adaptation;
  onComplete: () => void;
  onAttempt: () => void;
};

export function ChallengeView({
  challenge,
  attempts,
  adaptation,
  onComplete,
  onAttempt
}: ChallengeViewProps) {
  const [code, setCode] = useState(challenge.starterCode);
  const [results, setResults] = useState<ReturnType<typeof runTests> | null>(null);
  const [message, setMessage] = useState(defaultMessage);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    setCode(challenge.starterCode);
    setResults(null);
    setMessage(defaultMessage);
    setShowHint(false);
    setShowSolution(false);
  }, [challenge.id, challenge.starterCode]);

  const testsToRun = useMemo(() => selectTests(challenge.tests, adaptation), [challenge.tests, adaptation]);

  const handleRun = () => {
    const run = runTests(code, testsToRun);
    setResults(run);
    if (run.summary.passed === run.summary.total) {
      setMessage("Все тесты пройдены. Отлично!");
      onComplete();
    } else {
      setMessage("Есть ошибки — проверь контракт и крайние случаи.");
      onAttempt();
    }
  };

  const handleTab = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const updated = `${code.slice(0, start)}  ${code.slice(end)}`;
    setCode(updated);
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = start + 2;
    });
  };

  const canShowSolution = attempts >= 2;

  return (
    <section className="challenge">
      <div className="card">
        <h2>{challenge.title}</h2>
        <p>{challenge.description}</p>
        <div className="badge">Контракт: {challenge.contract.signature}</div>
        <ul>
          {challenge.contract.examples.map((example) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Код</h3>
        <textarea
          className="editor"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={handleTab}
          spellCheck={false}
        />
        <div className="button-row">
          <button className="primary-button" onClick={handleRun}>
            Run tests
          </button>
          <button className="secondary-button" onClick={() => setShowHint((prev) => !prev)}>
            {showHint ? "Скрыть подсказку" : "Показать подсказку"}
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              if (canShowSolution || window.confirm("Показать решение раньше?")) {
                setShowSolution(true);
              }
            }}
          >
            Показать решение
          </button>
        </div>
        {showHint && <div className="hint">{challenge.hint}</div>}
        {showSolution && <pre className="solution">{challenge.solution}</pre>}
      </div>

      <div className="card">
        <h3>Результаты</h3>
        <p>{message}</p>
        {results && (
          <div className="tests">
            {results.results.map((result, index) => (
              <div key={index} className={`test-item ${result.pass ? "pass" : "fail"}`}>
                <strong>{result.pass ? "PASS" : "FAIL"}</strong> — вход:{" "}
                {JSON.stringify(result.input)}
                {!result.pass && (
                  <div>
                    ожидается: {JSON.stringify(result.expected)} | получено:{" "}
                    {JSON.stringify(result.actual)}
                    {result.error ? ` | ошибка: ${result.error}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="badge">Попыток: {attempts}</div>
        <div className="badge">Тестов в этом режиме: {testsToRun.length}</div>
      </div>
    </section>
  );
}

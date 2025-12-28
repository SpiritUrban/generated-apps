import { useEffect, useMemo, useState } from "react";
import type { DevMindExercise, DevMindNote } from "../types";

const defaultNote = "";

type DevMindViewProps = {
  exercise: DevMindExercise;
  notes: Record<string, DevMindNote>;
  onSelectExercise: (id: string) => void;
  onSaveNote: (id: string, note: DevMindNote) => void;
};

function evaluate(text: string, exercise: DevMindExercise) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const lower = text.toLowerCase();
  const keywordHits = exercise.keywords.filter((keyword) => lower.includes(keyword)).length;
  return {
    items: lines.length,
    keywords: keywordHits
  };
}

export function DevMindView({ exercise, notes, onSelectExercise, onSaveNote }: DevMindViewProps) {
  const stored = notes[exercise.id];
  const [text, setText] = useState(stored?.text ?? defaultNote);

  useEffect(() => {
    setText(stored?.text ?? defaultNote);
  }, [exercise.id, stored?.text]);

  const evaluation = useMemo(() => evaluate(text, exercise), [text, exercise]);

  return (
    <section className="devmind">
      <div className="card">
        <h2>DevMind</h2>
        <p>Упражнения без кода — тренируем мышление.</p>
        <div className="dev-grid">
          {[
            { id: "steps", label: "Шаги" },
            { id: "edges", label: "Крайние" },
            { id: "contract", label: "Контракт" },
            { id: "testplan", label: "Тест-план" }
          ].map((item) => (
            <button key={item.id} onClick={() => onSelectExercise(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>{exercise.title}</h3>
        <p>{exercise.prompt}</p>
        <textarea
          className="note"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Пиши по одному пункту в строке..."
        />
        <div className="button-row">
          <button
            className="primary-button"
            onClick={() =>
              onSaveNote(exercise.id, {
                text,
                lastUpdated: Date.now(),
                evaluation
              })
            }
          >
            Сохранить
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Чеклист</h3>
        <ul>
          {exercise.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="badge">
          Пунктов: {evaluation.items} (минимум {exercise.minItems})
        </p>
        <p className="badge">Ключевых слов: {evaluation.keywords}</p>
      </div>
    </section>
  );
}

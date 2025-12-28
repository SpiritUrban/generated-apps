import type { Lesson } from "../types";

type LessonViewProps = {
  lesson: Lesson;
  isCompleted: boolean;
  shortMode: boolean;
  onGotIt: () => void;
  onLater: () => void;
};

function shortenText(text: string, sentencesCount: number) {
  const parts = text.split(". ");
  if (parts.length <= sentencesCount) return text;
  const short = parts.slice(0, sentencesCount).join(". ");
  return short.endsWith(".") ? short : `${short}.`;
}

export function LessonView({ lesson, isCompleted, shortMode, onGotIt, onLater }: LessonViewProps) {
  const displayText = shortMode ? shortenText(lesson.text, 3) : lesson.text;

  return (
    <section className="lesson">
      <div className="card">
        <h2>{lesson.title}</h2>
        <p>{displayText}</p>
        <div className="rule">{lesson.rule}</div>
        <p className="prompt">{lesson.prompt}</p>
        <div className="button-row">
          <button className="primary-button" onClick={onGotIt}>
            {isCompleted ? "Повторить как понял" : "Понял"}
          </button>
          <button className="secondary-button" onClick={onLater}>
            Повторить позже
          </button>
        </div>
      </div>
    </section>
  );
}

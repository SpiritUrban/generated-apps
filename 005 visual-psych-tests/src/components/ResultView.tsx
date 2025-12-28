import type { StoredResults } from "../types";
import { clamp01, normalizeToUnit } from "../utils/metrics";

type ResultViewProps = {
  results: StoredResults;
  onRestartTest: (id: "plane" | "moving" | "drag") => void;
  onBackHome: () => void;
  onReset: () => void;
};

const axes = ["Контроль", "Безопасность", "Фокус", "Ровность", "Решимость"];

const getProfile = (results: StoredResults) => {
  const plane = results.plane?.metrics;
  const moving = results.moving?.metrics;
  const drag = results.drag?.metrics;

  if (!plane || !moving || !drag) return null;

  const control = normalizeToUnit(plane.control ?? 0);
  const safety = normalizeToUnit(-(plane.risk ?? 0));
  const focus = clamp01(moving.focus ?? 0);
  const steadiness = clamp01(drag.steadiness ?? 0);
  const decisiveness = clamp01(
    ((plane.decisiveness ?? 0) + (drag.resolve ?? 0)) / 2
  );

  return {
    control,
    safety,
    focus,
    steadiness,
    decisiveness,
  };
};

const describe = (profile: ReturnType<typeof getProfile>) => {
  if (!profile) {
    return [
      "Профиль еще не собран полностью.",
      "Заверши оставшиеся тесты, чтобы увидеть общую картину.",
    ];
  }

  const notes: string[] = [];
  if (profile.control > 0.65) notes.push("ориентация на контроль");
  if (profile.control < 0.35) notes.push("ориентация на свободу");
  if (profile.safety > 0.65) notes.push("поиск безопасности");
  if (profile.safety < 0.35) notes.push("тяга к риску");
  if (profile.focus > 0.65) notes.push("устойчивый фокус");
  if (profile.focus < 0.35) notes.push("склонность к рассеиванию");
  if (profile.steadiness > 0.65) notes.push("спокойная траектория");
  if (profile.steadiness < 0.35) notes.push("повышенная реактивность");

  if (notes.length === 0) {
    notes.push("сбалансированная динамика");
  }

  return [
    notes.slice(0, 2).join(" · "),
    notes.length > 2 ? notes.slice(2).join(" · ") : "",
  ].filter(Boolean);
};

export default function ResultView({
  results,
  onRestartTest,
  onBackHome,
  onReset,
}: ResultViewProps) {
  const profile = getProfile(results);
  const summaryLines = describe(profile);
  const values = profile
    ? [
        profile.control,
        profile.safety,
        profile.focus,
        profile.steadiness,
        profile.decisiveness,
      ]
    : [0.4, 0.4, 0.4, 0.4, 0.4];

  const center = 110;
  const radius = 82;
  const angleStep = (Math.PI * 2) / axes.length;
  const points = values
    .map((value, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const r = radius * value;
      return {
        x: center + Math.cos(angle) * r,
        y: center + Math.sin(angle) * r,
      };
    })
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="result-screen">
      <div className="result-panel">
        <div className="result-title">Текущий профиль</div>
        <div className="radar-wrap">
          <svg width="220" height="220" className="radar">
            {axes.map((_, index) => {
              const angle = -Math.PI / 2 + index * angleStep;
              const x = center + Math.cos(angle) * radius;
              const y = center + Math.sin(angle) * radius;
              return (
                <line
                  key={`axis-${index}`}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(22, 40, 44, 0.15)"
                />
              );
            })}
            <polygon
              points={points}
              fill="rgba(50, 116, 120, 0.2)"
              stroke="rgba(35, 86, 90, 0.65)"
              strokeWidth="2"
            />
          </svg>
          {axes.map((axis, index) => {
            const angle = -Math.PI / 2 + index * angleStep;
            const labelRadius = radius + 26;
            const x = center + Math.cos(angle) * labelRadius;
            const y = center + Math.sin(angle) * labelRadius;
            return (
              <span
                key={axis}
                className="axis-label"
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                {axis}
              </span>
            );
          })}
        </div>
        <div className="summary">
          {summaryLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div className="result-actions">
          <button className="primary" onClick={onBackHome}>
            К тестам
          </button>
          <button className="ghost" onClick={() => onRestartTest("plane")}>
            Пройти снова
          </button>
          <button className="ghost" onClick={onReset}>
            Сбросить данные
          </button>
        </div>
      </div>
      <div className="result-list">
        <div className="result-subtitle">Доступные тесты</div>
        <div className="test-cards">
          {[
            { id: "plane", title: "Плоскость 2D" },
            { id: "moving", title: "Движущиеся объекты" },
            { id: "drag", title: "Зона комфорта" },
          ].map((item) => (
            <button
              key={item.id}
              className="card"
              onClick={() =>
                onRestartTest(item.id as "plane" | "moving" | "drag")
              }
            >
              <span>{item.title}</span>
              <span className="status">
                {results[item.id as keyof StoredResults] ? "готово" : "не пройдено"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

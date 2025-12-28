type Recommendation = {
  label: string;
  detail: string;
  action: () => void;
};

type DashboardProps = {
  completedLessons: number;
  completedChallenges: number;
  totalLessons: number;
  totalChallenges: number;
  recommendation: Recommendation;
  onStartLesson: () => void;
  onStartChallenge: () => void;
  onStartDevMind: () => void;
};

export function Dashboard({
  completedLessons,
  completedChallenges,
  totalLessons,
  totalChallenges,
  recommendation,
  onStartLesson,
  onStartChallenge,
  onStartDevMind
}: DashboardProps) {
  const lessonProgress = Math.round((completedLessons / totalLessons) * 100);
  const challengeProgress = Math.round((completedChallenges / totalChallenges) * 100);

  return (
    <section className="dashboard">
      <div className="card">
        <h2>Dashboard</h2>
        <p>Учишься мыслить как разработчик: коротко, осмысленно, без суеты.</p>
        <div className="grid">
          <div className="progress-bar">
            <span className="badge">
              Уроки: {completedLessons} / {totalLessons}
            </span>
            <div className="bar">
              <span style={{ width: `${lessonProgress}%` }} />
            </div>
          </div>
          <div className="progress-bar">
            <span className="badge">
              Задачи: {completedChallenges} / {totalChallenges}
            </span>
            <div className="bar">
              <span style={{ width: `${challengeProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Продолжить</h3>
        <p>{recommendation.detail}</p>
        <div className="button-row">
          <button className="primary-button" onClick={recommendation.action}>
            {recommendation.label}
          </button>
          <button className="secondary-button" onClick={onStartLesson}>
            Lesson
          </button>
          <button className="secondary-button" onClick={onStartChallenge}>
            Challenge
          </button>
          <button className="secondary-button" onClick={onStartDevMind}>
            DevMind
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Быстрый выбор</h3>
        <div className="button-row">
          <button className="secondary-button" onClick={onStartLesson}>
            Открыть урок
          </button>
          <button className="secondary-button" onClick={onStartChallenge}>
            Открыть задачу
          </button>
          <button className="secondary-button" onClick={onStartDevMind}>
            DevMind-упражнение
          </button>
        </div>
      </div>
    </section>
  );
}

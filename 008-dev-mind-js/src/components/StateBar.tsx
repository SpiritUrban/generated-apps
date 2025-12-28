import { useEffect, useState } from "react";
import type { UserState } from "../types";

type StateBarProps = {
  userState: UserState;
  onSave: (state: UserState) => void;
};

export function StateBar({ userState, onSave }: StateBarProps) {
  const [draft, setDraft] = useState(userState);

  useEffect(() => {
    setDraft(userState);
  }, [userState]);

  const handleChange = (key: keyof UserState, value: number) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="statebar">
      <label>
        focus: {draft.focus}
        <input
          type="range"
          min={0}
          max={5}
          value={draft.focus}
          onChange={(event) => handleChange("focus", Number(event.target.value))}
        />
      </label>
      <label>
        fatigue: {draft.fatigue}
        <input
          type="range"
          min={0}
          max={5}
          value={draft.fatigue}
          onChange={(event) => handleChange("fatigue", Number(event.target.value))}
        />
      </label>
      <label>
        tension: {draft.tension}
        <input
          type="range"
          min={0}
          max={5}
          value={draft.tension}
          onChange={(event) => handleChange("tension", Number(event.target.value))}
        />
      </label>
      <button onClick={() => onSave(draft)}>Сохранить состояние</button>
    </div>
  );
}

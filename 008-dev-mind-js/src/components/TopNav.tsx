import type { UserState, View } from "../types";
import { StateBar } from "./StateBar";

type TopNavProps = {
  view: View;
  onNavigate: (view: View) => void;
  userState: UserState;
  onSaveState: (state: UserState) => void;
};

export function TopNav({ view, onNavigate, userState, onSaveState }: TopNavProps) {
  return (
    <header className="topbar">
      <div className="brand">DEV-MIND JS</div>
      <nav className="nav">
        <button className={view === "dashboard" ? "active" : ""} onClick={() => onNavigate("dashboard")}>
          Dashboard
        </button>
        <button className={view === "lesson" ? "active" : ""} onClick={() => onNavigate("lesson")}>
          Lesson
        </button>
        <button className={view === "challenge" ? "active" : ""} onClick={() => onNavigate("challenge")}>
          Challenge
        </button>
        <button className={view === "devmind" ? "active" : ""} onClick={() => onNavigate("devmind")}>
          DevMind
        </button>
      </nav>
      <StateBar userState={userState} onSave={onSaveState} />
    </header>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateEntryInput } from "@strat-j/contracts";
import { createEntry } from "../api";

const types: CreateEntryInput["type"][] = ["LOG", "DECISION", "REVIEW"];

export default function AddEntry() {
  const navigate = useNavigate();
  const [type, setType] = useState<CreateEntryInput["type"]>("LOG");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [stateEnergy, setStateEnergy] = useState(3);
  const [stateFocus, setStateFocus] = useState(3);
  const [stateTension, setStateTension] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: CreateEntryInput = {
        type,
        text: text.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        stateEnergy,
        stateFocus,
        stateTension
      };
      await createEntry(payload);
      navigate("/");
    } catch (err) {
      setError("Could not save entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Add Entry</h2>
      </div>
      <form className="form" onSubmit={onSave}>
        <label className="field">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as CreateEntryInput["type"])}>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Text</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What happened? What did you decide?"
            required
          />
        </label>
        <label className="field">
          <span>Tags</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="strategy, health, team"
          />
        </label>
        <div className="range-grid">
          <label className="field">
            <span>Energy: {stateEnergy}</span>
            <input
              type="range"
              min={0}
              max={5}
              value={stateEnergy}
              onChange={(e) => setStateEnergy(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Focus: {stateFocus}</span>
            <input
              type="range"
              min={0}
              max={5}
              value={stateFocus}
              onChange={(e) => setStateFocus(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Tension: {stateTension}</span>
            <input
              type="range"
              min={0}
              max={5}
              value={stateTension}
              onChange={(e) => setStateTension(Number(e.target.value))}
            />
          </label>
        </div>
        {error ? <div className="error">{error}</div> : null}
        <div className="form-actions">
          <button className="button primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

import { Entry } from "@strat-j/contracts";

type Props = {
  items: Entry[];
  emptyLabel: string;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString();
}

export default function EntryList({ items, emptyLabel }: Props) {
  if (!items.length) {
    return <div className="empty">{emptyLabel}</div>;
  }

  return (
    <div className="entry-list">
      {items.map((entry) => (
        <article key={entry.id} className="entry-card">
          <div className="entry-meta">
            <span className={`entry-type entry-type-${entry.type.toLowerCase()}`}>
              {entry.type}
            </span>
            <span className="entry-date">{formatDate(entry.createdAt)}</span>
          </div>
          <div className="entry-text">{entry.text}</div>
          <div className="entry-tags">
            {entry.tags.map((tag) => (
              <span className="tag" key={`${entry.id}-${tag}`}>
                {tag}
              </span>
            ))}
          </div>
          <div className="entry-state">
            <span>Energy: {entry.stateEnergy}</span>
            <span>Focus: {entry.stateFocus}</span>
            <span>Tension: {entry.stateTension}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

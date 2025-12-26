import { useEffect, useState } from "react";
import { Entry, EntryType } from "@strat-j/contracts";
import { listEntries, listTags } from "../api";
import EntryList from "../components/EntryList";

const types: Array<EntryType | ""> = ["", "LOG", "DECISION", "REVIEW"];

export default function Search() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<EntryType | "">("");
  const [tag, setTag] = useState("");
  const [items, setItems] = useState<Entry[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listTags().then(setTags).catch(() => setTags([]));
  }, []);

  const onSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await listEntries({
        q: query.trim() || undefined,
        type: type || undefined,
        tag: tag.trim() || undefined
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Search</h2>
      </div>
      <form className="search-form" onSubmit={onSearch}>
        <label className="field">
          <span>Query</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="text contains..." />
        </label>
        <label className="field">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as EntryType | "")}>
            {types.map((t) => (
              <option key={t || "all"} value={t}>
                {t || "All"}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tag</span>
          <input list="tags" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="tag" />
          <datalist id="tags">
            {tags.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      <EntryList items={items} emptyLabel="No matches yet." />
    </section>
  );
}


import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Entry } from "@strat-j/contracts";
import { listEntries } from "../api";
import EntryList from "../components/EntryList";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

export default function Today() {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const range = useMemo(() => getTodayRange(), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listEntries(range)
      .then((data) => {
        if (active) {
          setItems(data);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [range]);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Today</h2>
        <Link className="button primary" to="/add">
          + Add
        </Link>
      </div>
      {loading ? <div className="empty">Loading...</div> : null}
      {!loading ? <EntryList items={items} emptyLabel="No entries yet." /> : null}
    </section>
  );
}

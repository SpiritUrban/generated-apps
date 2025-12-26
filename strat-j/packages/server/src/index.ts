import express from "express";
import cors from "cors";
import {
  CreateEntryInputSchema,
  ListEntriesQuerySchema
} from "@strat-j/contracts";
import { createEntry, initDb, listEntries, listTags } from "@strat-j/storage";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

initDb();

app.post("/api/entries", (req, res) => {
  const parsed = CreateEntryInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const entry = createEntry(parsed.data);
  return res.json({ ok: true, entry });
});

app.get("/api/entries", (req, res) => {
  const query = {
    from: typeof req.query.from === "string" ? req.query.from : undefined,
    to: typeof req.query.to === "string" ? req.query.to : undefined,
    q: typeof req.query.q === "string" ? req.query.q : undefined,
    type: typeof req.query.type === "string" ? req.query.type : undefined,
    tag: typeof req.query.tag === "string" ? req.query.tag : undefined
  };
  const parsed = ListEntriesQuerySchema.safeParse(query);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const items = listEntries(parsed.data);
  return res.json({ ok: true, items });
});

app.get("/api/tags", (_req, res) => {
  const items = listTags();
  return res.json({ ok: true, items });
});

const port = 8787;
app.listen(port, "0.0.0.0", () => {
  console.log(`STRAT-J server listening on http://0.0.0.0:${port}`);
});

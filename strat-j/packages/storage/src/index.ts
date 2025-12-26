import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { CreateEntryInput, Entry, ListEntriesQuery } from "@strat-j/contracts";
import { INIT_SQL } from "./schema";

let db: Database.Database | null = null;

const DB_PATH = path.resolve(__dirname, "..", "data", "strat-j.sqlite");

export function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!db) {
    db = new Database(DB_PATH);
    db.exec(INIT_SQL);
  }
}

function getDb() {
  if (!db) {
    initDb();
  }
  return db as Database.Database;
}

export function createEntry(input: CreateEntryInput): Entry {
  const entry: Entry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    type: input.type,
    text: input.text,
    tags: input.tags,
    stateEnergy: input.stateEnergy,
    stateFocus: input.stateFocus,
    stateTension: input.stateTension
  };

  const stmt = getDb().prepare(
    "INSERT INTO entries (id, createdAt, type, text, tagsJson, stateEnergy, stateFocus, stateTension) " +
      "VALUES (@id, @createdAt, @type, @text, @tagsJson, @stateEnergy, @stateFocus, @stateTension)"
  );
  stmt.run({
    id: entry.id,
    createdAt: entry.createdAt,
    type: entry.type,
    text: entry.text,
    tagsJson: JSON.stringify(entry.tags),
    stateEnergy: entry.stateEnergy,
    stateFocus: entry.stateFocus,
    stateTension: entry.stateTension
  });

  return entry;
}

export function listEntries(query: ListEntriesQuery): Entry[] {
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (query.from) {
    conditions.push("createdAt >= @from");
    params.from = query.from;
  }
  if (query.to) {
    conditions.push("createdAt <= @to");
    params.to = query.to;
  }
  if (query.type) {
    conditions.push("type = @type");
    params.type = query.type;
  }
  if (query.q) {
    conditions.push("text LIKE @q");
    params.q = `%${query.q}%`;
  }
  if (query.tag) {
    conditions.push("tagsJson LIKE @tag");
    params.tag = `%\\\"${query.tag}\\\"%`;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = getDb()
    .prepare(`SELECT * FROM entries ${where} ORDER BY createdAt DESC`)
    .all(params);

  return rows.map((row: any) => ({
    id: row.id,
    createdAt: row.createdAt,
    type: row.type,
    text: row.text,
    tags: JSON.parse(row.tagsJson || "[]"),
    stateEnergy: row.stateEnergy,
    stateFocus: row.stateFocus,
    stateTension: row.stateTension
  }));
}

export function listTags(): string[] {
  const rows = getDb().prepare("SELECT tagsJson FROM entries").all();
  const tags = new Set<string>();

  for (const row of rows as Array<{ tagsJson: string }>) {
    const parsed = JSON.parse(row.tagsJson || "[]") as string[];
    for (const tag of parsed) {
      if (tag.trim()) {
        tags.add(tag.trim());
      }
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

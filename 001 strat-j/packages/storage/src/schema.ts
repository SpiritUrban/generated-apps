export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  tagsJson TEXT NOT NULL,
  stateEnergy INTEGER NOT NULL,
  stateFocus INTEGER NOT NULL,
  stateTension INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_entries_createdAt ON entries(createdAt);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
`;

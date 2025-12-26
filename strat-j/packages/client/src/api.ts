import { CreateEntryInput, Entry } from "@strat-j/contracts";

export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  const res = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    throw new Error("Failed to create entry");
  }
  const data = await res.json();
  return data.entry as Entry;
}

export async function listEntries(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  const res = await fetch(`/api/entries?${query.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to load entries");
  }
  const data = await res.json();
  return data.items as Entry[];
}

export async function listTags(): Promise<string[]> {
  const res = await fetch("/api/tags");
  if (!res.ok) {
    throw new Error("Failed to load tags");
  }
  const data = await res.json();
  return data.items as string[];
}

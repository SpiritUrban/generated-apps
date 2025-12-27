import { z } from "zod";

export const EntryTypeSchema = z.enum(["LOG", "DECISION", "REVIEW"]);
export type EntryType = z.infer<typeof EntryTypeSchema>;

export const EntrySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  type: EntryTypeSchema,
  text: z.string().min(1),
  tags: z.array(z.string()),
  stateEnergy: z.number().int().min(0).max(5),
  stateFocus: z.number().int().min(0).max(5),
  stateTension: z.number().int().min(0).max(5)
});
export type Entry = z.infer<typeof EntrySchema>;

export const CreateEntryInputSchema = z.object({
  type: EntryTypeSchema,
  text: z.string().min(1),
  tags: z.array(z.string()),
  stateEnergy: z.number().int().min(0).max(5),
  stateFocus: z.number().int().min(0).max(5),
  stateTension: z.number().int().min(0).max(5)
});
export type CreateEntryInput = z.infer<typeof CreateEntryInputSchema>;

export const ListEntriesQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  q: z.string().min(1).optional(),
  type: EntryTypeSchema.optional(),
  tag: z.string().min(1).optional()
});
export type ListEntriesQuery = z.infer<typeof ListEntriesQuerySchema>;

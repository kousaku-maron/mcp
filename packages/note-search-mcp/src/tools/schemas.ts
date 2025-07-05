import { z, ZodRawShape } from "zod";

export const NoteArticleSchema: ZodRawShape = {
  notekey: z.string().describe("Note article key (e.g., 'n4f0c7b884789')"),
};

export const NoteCreatorArticlesSchema: ZodRawShape = {
  creator: z.string().describe("Note creator username (e.g., 'username')"),
};

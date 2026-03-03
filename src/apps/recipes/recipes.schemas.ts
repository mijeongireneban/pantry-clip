import { z } from "zod";

export const sourceTypeSchema = z.enum([
  "youtube_shorts",
  "instagram_reels",
  "other"
]);

export const summarySourceSchema = z.enum(["manual", "ai"]);

export const createRecipeSchema = z.object({
  sourceUrl: z.string().url(),
  sourceType: sourceTypeSchema,
  title: z.string().trim().min(1).max(140),
  ingredientsText: z.string().trim().min(1),
  stepsText: z.string().trim().min(1),
  summarySource: summarySourceSchema
});

export const summarizeRecipeSchema = z.object({
  sourceUrl: z.string().url()
});

export const listRecipesQuerySchema = z.object({
  q: z.string().trim().optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const updateRecipeSchema = createRecipeSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided."
);

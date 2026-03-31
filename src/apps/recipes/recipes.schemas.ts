import { z } from "zod";

export function isYouTubeShortsUrl(sourceUrl: string): boolean {
  try {
    const parsed = new URL(sourceUrl);
    const hostname = parsed.hostname.toLowerCase();
    const isYouTubeHost =
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com";

    return isYouTubeHost && /^\/shorts\/[^/?#]+\/?$/.test(parsed.pathname);
  } catch {
    return false;
  }
}

export const sourceTypeSchema = z.enum([
  "youtube_shorts",
  "instagram_reels",
  "other"
]);

export const summarySourceSchema = z.enum(["manual", "ai"]);
export const uiLanguageSchema = z.enum(["ko", "en"]);

export const summarizeJobStatusSchema = z.enum([
  "queued",
  "extracting",
  "summarizing",
  "completed",
  "insufficient_context",
  "failed"
]);

export const createRecipeSchema = z.object({
  sourceUrl: z.string().url(),
  sourceType: sourceTypeSchema,
  title: z.string().trim().min(1).max(140),
  ingredientsText: z.string().trim().min(1),
  stepsText: z.string().trim().min(1),
  summarySource: summarySourceSchema,
  aiConfidence: z.number().min(0).max(1).nullable().optional()
});

export const saveRecipeUrlSchema = z.object({
  sourceUrl: z.string().url(),
  title: z.string().trim().max(140).optional(),
  language: uiLanguageSchema.optional()
});

export const summarizeRecipeSchema = z.object({
  sourceUrl: z.string().url()
});

export const summarizeJobHandleSchema = z.object({
  jobId: z.string().uuid(),
  status: summarizeJobStatusSchema
});

export const summarizeDraftResultSchema = z.object({
  titleDraft: z.string(),
  ingredientsDraft: z.string(),
  stepsDraft: z.string()
});

export const summarizeJobErrorSchema = z.object({
  code: z.string(),
  message: z.string()
});

export const summarizeJobResultSchema = z.object({
  jobId: z.string().uuid(),
  status: summarizeJobStatusSchema,
  sourceUrl: z.string().url(),
  sourceType: sourceTypeSchema,
  confidence: z.number().min(0).max(1).nullable(),
  draft: summarizeDraftResultSchema.nullable(),
  error: summarizeJobErrorSchema.nullable()
});

export const listRecipesQuerySchema = z.object({
  q: z.string().trim().optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const updateRecipeSchema = createRecipeSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided."
  );

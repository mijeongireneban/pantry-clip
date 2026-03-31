import { Prisma, SourceType as PrismaSourceType } from "@prisma/client";

import {
  summarizeDraftResultSchema,
  summarizeJobErrorSchema
} from "@/src/apps/recipes/recipes.schemas";
import type {
  SummarizeDraftResult,
  SummarizedRecipeDraft,
  SummarizeJobHandle,
  SummarizeJobResult,
  SummarizeJobStatus,
  SummarizeRecipeInput
} from "@/src/apps/recipes/recipes.types";
import { prisma } from "@/src/lib/server/prisma";
import { inferSourceType } from "@/src/lib/server/recipes/recipes.utils";
import type { ExtractedRecipeContext } from "@/src/lib/server/recipes/recipes-extraction.service";

type SummarizeJobRecord = {
  id: string;
  sourceUrl: string;
  sourceType: PrismaSourceType;
  status: SummarizeJobStatus;
  confidence: number | null;
  draftPayload: Prisma.JsonValue | null;
  errorCode: string | null;
  errorMessage: string | null;
};

function parseDraftPayload(payload: Prisma.JsonValue | null): SummarizeDraftResult | null {
  if (!payload) {
    return null;
  }

  const parsed = summarizeDraftResultSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

function toSummarizeJobResult(record: SummarizeJobRecord): SummarizeJobResult {
  const error =
    record.errorCode && record.errorMessage
      ? summarizeJobErrorSchema.parse({
          code: record.errorCode,
          message: record.errorMessage
        })
      : null;

  return {
    jobId: record.id,
    status: record.status,
    sourceUrl: record.sourceUrl,
    sourceType: record.sourceType,
    confidence: record.confidence,
    draft: parseDraftPayload(record.draftPayload),
    error
  };
}

export async function createSummarizeJob(
  userId: string,
  input: SummarizeRecipeInput
): Promise<SummarizeJobHandle> {
  const sourceUrl = input.sourceUrl.trim();
  const created = await prisma.summarizeJob.create({
    data: {
      userId,
      sourceUrl,
      sourceType: inferSourceType(sourceUrl),
      status: "queued"
    },
    select: {
      id: true,
      status: true
    }
  });

  return {
    jobId: created.id,
    status: created.status
  };
}

export async function getSummarizeJobById(
  userId: string,
  jobId: string
): Promise<SummarizeJobResult | null> {
  const job = await prisma.summarizeJob.findFirst({
    where: {
      id: jobId,
      userId
    },
    select: {
      id: true,
      sourceUrl: true,
      sourceType: true,
      status: true,
      confidence: true,
      draftPayload: true,
      errorCode: true,
      errorMessage: true
    }
  });

  return job ? toSummarizeJobResult(job) : null;
}

export async function getSummarizeJobForWorker(jobId: string) {
  return prisma.summarizeJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      userId: true,
      sourceUrl: true,
      sourceType: true,
      status: true
    }
  });
}

export async function markSummarizeJobExtracting(jobId: string) {
  await prisma.summarizeJob.update({
    where: { id: jobId },
    data: {
      status: "extracting",
      errorCode: null,
      errorMessage: null,
      confidence: null,
      draftPayload: Prisma.JsonNull,
      updatedAt: new Date()
    }
  });
}

export async function storeSummarizeJobEvidence(
  jobId: string,
  context: ExtractedRecipeContext
) {
  await prisma.summarizeJob.update({
    where: { id: jobId },
    data: {
      canonicalVideoId: context.canonicalVideoId,
      titleHint: context.title || null,
      descriptionHint: context.description || null,
      subtitleText: context.subtitleText || null,
      transcriptText: context.transcriptText || null,
      evidenceSources: context.evidenceSources as Prisma.InputJsonValue,
      updatedAt: new Date()
    }
  });
}

export async function markSummarizeJobSummarizing(jobId: string) {
  await prisma.summarizeJob.update({
    where: { id: jobId },
    data: {
      status: "summarizing",
      updatedAt: new Date()
    }
  });
}

export async function completeSummarizeJob(
  jobId: string,
  context: ExtractedRecipeContext,
  draft: SummarizedRecipeDraft
) {
  await prisma.summarizeJob.update({
    where: { id: jobId },
    data: {
      status: "completed",
      canonicalVideoId: context.canonicalVideoId,
      titleHint: context.title || null,
      descriptionHint: context.description || null,
      subtitleText: context.subtitleText || null,
      transcriptText: context.transcriptText || null,
      evidenceSources: context.evidenceSources as Prisma.InputJsonValue,
      confidence: draft.confidence ?? null,
      draftPayload: {
        titleDraft: draft.titleDraft,
        ingredientsDraft: draft.ingredientsDraft,
        stepsDraft: draft.stepsDraft
      } as Prisma.InputJsonValue,
      errorCode: null,
      errorMessage: null,
      updatedAt: new Date()
    }
  });
}

export async function markSummarizeJobInsufficientContext(
  jobId: string,
  context: ExtractedRecipeContext,
  message: string
) {
  await prisma.summarizeJob.update({
    where: { id: jobId },
    data: {
      status: "insufficient_context",
      canonicalVideoId: context.canonicalVideoId,
      titleHint: context.title || null,
      descriptionHint: context.description || null,
      subtitleText: context.subtitleText || null,
      transcriptText: context.transcriptText || null,
      evidenceSources: context.evidenceSources as Prisma.InputJsonValue,
      confidence: 0,
      draftPayload: Prisma.JsonNull,
      errorCode: "INSUFFICIENT_CONTEXT",
      errorMessage: message,
      updatedAt: new Date()
    }
  });
}

export async function markSummarizeJobFailed(
  jobId: string,
  errorCode: string,
  message: string
) {
  await prisma.summarizeJob.update({
    where: { id: jobId },
    data: {
      status: "failed",
      errorCode,
      errorMessage: message,
      updatedAt: new Date()
    }
  });
}

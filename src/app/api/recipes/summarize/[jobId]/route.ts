import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireUserId } from "@/src/lib/auth/require-user-id";
import { getSummarizeJobById } from "@/src/lib/server/recipes/recipes-summarize-jobs.repository";
import { ApiError, toErrorResponse } from "@/src/lib/utils/api-error";

const paramsSchema = z.object({
  jobId: z.string().uuid()
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const userId = await requireUserId();
    const { jobId } = paramsSchema.parse(await context.params);
    const job = await getSummarizeJobById(userId, jobId);

    if (!job) {
      throw new ApiError("NOT_FOUND", "Summarize job not found", 404);
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

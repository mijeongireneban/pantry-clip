import { after, NextRequest, NextResponse } from "next/server";

import { summarizeRecipeSchema } from "@/src/apps/recipes/recipes.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import { runSummarizeJob } from "@/src/lib/server/recipes/recipes-summarize-job-runner";
import { createSummarizeJob } from "@/src/lib/server/recipes/recipes-summarize-jobs.repository";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const json = await request.json();
    const input = summarizeRecipeSchema.parse(json);
    const job = await createSummarizeJob(userId, input);

    after(async () => {
      try {
        await runSummarizeJob(job.jobId);
      } catch (error) {
        console.error("Failed to run summarize job", { jobId: job.jobId, error });
      }
    });

    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { summarizeRecipeSchema } from "@/src/apps/recipes/recipes.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import { summarizeRecipeFromUrl } from "@/src/lib/server/recipes/recipes.summarizer";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireUserId();
    const json = await request.json();
    const input = summarizeRecipeSchema.parse(json);
    const draft = await summarizeRecipeFromUrl(input);
    return NextResponse.json(draft, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

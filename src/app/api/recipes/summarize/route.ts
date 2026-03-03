import { NextRequest, NextResponse } from "next/server";
import { summarizeRecipeSchema } from "@/src/apps/recipes/recipes.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import { inferSourceType } from "@/src/lib/server/recipes/recipes.utils";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireUserId();
    const json = await request.json();
    const input = summarizeRecipeSchema.parse(json);
    const sourceType = inferSourceType(input.sourceUrl);

    // TODO: Replace with OpenAI summarize call.
    return NextResponse.json(
      {
        sourceType,
        titleDraft: "Untitled recipe draft",
        ingredientsDraft: "- ingredient 1\n- ingredient 2",
        stepsDraft: "1. Step one\n2. Step two",
        confidence: 0.35
      },
      { status: 200 }
    );
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

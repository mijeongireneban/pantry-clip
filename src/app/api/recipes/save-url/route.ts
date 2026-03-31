import { NextRequest, NextResponse } from "next/server";

import { saveRecipeUrlSchema } from "@/src/apps/recipes/recipes.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import { saveRecipeFromUrl } from "@/src/lib/server/recipes/recipes-save-url.service";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const json = await request.json();
    const input = saveRecipeUrlSchema.parse(json);
    const created = await saveRecipeFromUrl(userId, input);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toggleRecipeSavedSchema } from "@/src/apps/recipe-collections/recipe-collections.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import { toggleRecipeSaved } from "@/src/lib/server/recipe-collections/recipe-collections.repository";
import { ApiError, toErrorResponse } from "@/src/lib/utils/api-error";

const recipeIdSchema = z.object({
  id: z.string().uuid()
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = recipeIdSchema.parse(await context.params);
    const json = await request.json();
    const input = toggleRecipeSavedSchema.parse(json);
    const updated = await toggleRecipeSaved(userId, id, input.isSaved);

    if (!updated) {
      throw new ApiError("NOT_FOUND", "Recipe not found", 404);
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { setRecipeCollectionsSchema } from "@/src/apps/recipe-collections/recipe-collections.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import { setRecipeCollections } from "@/src/lib/server/recipe-collections/recipe-collections.repository";
import { ApiError, toErrorResponse } from "@/src/lib/utils/api-error";

const recipeIdSchema = z.object({
  id: z.string().uuid()
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = recipeIdSchema.parse(await context.params);
    const json = await request.json();
    const input = setRecipeCollectionsSchema.parse(json);
    const updated = await setRecipeCollections(userId, id, input.collectionIds);

    if (!updated) {
      throw new ApiError("NOT_FOUND", "Recipe not found", 404);
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

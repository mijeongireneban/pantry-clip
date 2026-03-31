import { NextRequest, NextResponse } from "next/server";

import { listRecipeCollectionRecipesQuerySchema } from "@/src/apps/recipe-collections/recipe-collections.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import { listSavedRecipes } from "@/src/lib/server/recipe-collections/recipe-collections.repository";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const query = listRecipeCollectionRecipesQuerySchema.parse({
      collectionId:
        request.nextUrl.searchParams.get("collectionId") ?? undefined,
      cursor: request.nextUrl.searchParams.get("cursor") ?? undefined,
      limit: request.nextUrl.searchParams.get("limit") ?? undefined
    });
    const recipes = await listSavedRecipes(userId, query);

    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

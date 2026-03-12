import { NextRequest, NextResponse } from "next/server";

import {
  createRecipeSchema,
  listRecipesQuerySchema
} from "@/src/apps/recipes/recipes.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import { createRecipe, listRecipes } from "@/src/lib/server/recipes/recipes.repository";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const query = listRecipesQuerySchema.parse({
      q: request.nextUrl.searchParams.get("q") ?? undefined,
      cursor: request.nextUrl.searchParams.get("cursor") ?? undefined,
      limit: request.nextUrl.searchParams.get("limit") ?? undefined
    });

    const data = await listRecipes(userId, query);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const json = await request.json();
    const input = createRecipeSchema.parse(json);
    const created = await createRecipe(userId, input);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

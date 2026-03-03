import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateRecipeSchema } from "@/src/apps/recipes/recipes.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import {
  deleteRecipe,
  getRecipeById,
  updateRecipe
} from "@/src/lib/server/recipes/recipes.repository";
import { ApiError, toErrorResponse } from "@/src/lib/utils/api-error";

const idSchema = z.object({
  id: z.string().uuid().or(z.string().min(1))
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = idSchema.parse(await context.params);
    const recipe = await getRecipeById(userId, id);

    if (!recipe) {
      throw new ApiError("NOT_FOUND", "Recipe not found", 404);
    }

    return NextResponse.json(recipe, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = idSchema.parse(await context.params);
    const json = await request.json();
    const patch = updateRecipeSchema.parse(json);
    const updated = await updateRecipe(userId, id, patch);

    if (!updated) {
      throw new ApiError("NOT_FOUND", "Recipe not found", 404);
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = idSchema.parse(await context.params);
    const deleted = await deleteRecipe(userId, id);

    if (!deleted) {
      throw new ApiError("NOT_FOUND", "Recipe not found", 404);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

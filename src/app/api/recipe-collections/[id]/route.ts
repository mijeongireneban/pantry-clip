import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { updateRecipeCollectionSchema } from "@/src/apps/recipe-collections/recipe-collections.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import {
  deleteRecipeCollection,
  updateRecipeCollection
} from "@/src/lib/server/recipe-collections/recipe-collections.repository";
import { ApiError, toErrorResponse } from "@/src/lib/utils/api-error";

const collectionIdSchema = z.object({
  id: z.string().uuid()
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = collectionIdSchema.parse(await context.params);
    const json = await request.json();
    const input = updateRecipeCollectionSchema.parse(json);
    const updated = await updateRecipeCollection(userId, id, input);

    if (!updated) {
      throw new ApiError("NOT_FOUND", "Collection not found", 404);
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
    const { id } = collectionIdSchema.parse(await context.params);
    const deleted = await deleteRecipeCollection(userId, id);

    if (!deleted) {
      throw new ApiError("NOT_FOUND", "Collection not found", 404);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { createRecipeCollectionSchema } from "@/src/apps/recipe-collections/recipe-collections.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import {
  createRecipeCollection,
  listRecipeCollections
} from "@/src/lib/server/recipe-collections/recipe-collections.repository";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const collections = await listRecipeCollections(userId);

    return NextResponse.json(collections, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const json = await request.json();
    const input = createRecipeCollectionSchema.parse(json);
    const created = await createRecipeCollection(userId, input);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

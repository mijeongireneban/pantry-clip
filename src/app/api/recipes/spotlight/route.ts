import { NextResponse } from "next/server";

import { requireUserId } from "@/src/lib/auth/require-user-id";
import { getRecipeSpotlight } from "@/src/lib/server/recipes/recipes-spotlight.service";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const spotlight = await getRecipeSpotlight(userId);

    return NextResponse.json(spotlight, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { updateProfileSchema } from "@/src/apps/profile/profile.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import {
  getUserProfile,
  updateUserProfile
} from "@/src/lib/server/profile/profile.repository";
import { toErrorResponse } from "@/src/lib/utils/api-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const profile = await getUserProfile(userId);

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const json = await request.json();
    const input = updateProfileSchema.parse(json);
    const updated = await updateUserProfile(userId, input);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

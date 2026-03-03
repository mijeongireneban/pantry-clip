import { ApiError } from "@/src/lib/utils/api-error";

// Temporary auth stub. Replace with real Supabase session extraction.
export async function requireUserId(): Promise<string> {
  const userId = process.env.DEV_USER_ID ?? "dev-user-id";

  if (!userId) {
    throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  }

  return userId;
}

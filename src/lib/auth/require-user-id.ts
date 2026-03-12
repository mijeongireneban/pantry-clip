import { ApiError } from "@/src/lib/utils/api-error";
import { prisma } from "@/src/lib/server/prisma";
import { getSupabaseServerClient } from "@/src/lib/auth/supabase-server";

export async function requireUserId(): Promise<string> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email ?? `${user.id}@users.pantryclip.local`
    },
    create: {
      id: user.id,
      email: user.email ?? `${user.id}@users.pantryclip.local`
    }
  });

  return user.id;
}

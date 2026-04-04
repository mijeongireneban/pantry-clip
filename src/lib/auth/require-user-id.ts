import { Prisma } from "@prisma/client";

import { getSupabaseServerClient } from "@/src/lib/auth/supabase-server";
import { prisma } from "@/src/lib/server/prisma";
import { ApiError } from "@/src/lib/utils/api-error";

export async function requireUserId(): Promise<string> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  }

  const email = user.email ?? `${user.id}@users.pantryclip.local`;

  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email },
      create: {
        id: user.id,
        email
      }
    });
  } catch (upsertError) {
    if (
      upsertError instanceof Prisma.PrismaClientKnownRequestError &&
      upsertError.code === "P2002"
    ) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingUser) {
        return existingUser.id;
      }
    }

    throw upsertError;
  }

  return user.id;
}

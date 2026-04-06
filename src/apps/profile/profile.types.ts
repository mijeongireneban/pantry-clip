import type { z } from "zod";

import { updateProfileSchema } from "@/src/apps/profile/profile.schemas";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

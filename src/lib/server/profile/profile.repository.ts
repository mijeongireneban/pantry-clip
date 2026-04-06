import { Prisma } from "@prisma/client";

import type {
  UpdateProfileInput,
  UserProfile
} from "@/src/apps/profile/profile.types";
import { prisma } from "@/src/lib/server/prisma";
import { ApiError } from "@/src/lib/utils/api-error";

function toUserProfile(record: {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile {
  return {
    id: record.id,
    email: record.email,
    username: record.username,
    avatarUrl: record.avatarUrl,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const profile = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!profile) {
    throw new ApiError("NOT_FOUND", "Profile not found", 404);
  }

  return toUserProfile(profile);
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserProfile> {
  try {
    const updated = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        username: input.username.trim().toLowerCase(),
        avatarUrl: input.avatarUrl.trim() || null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return toUserProfile(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "That username is already taken.",
        400
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ApiError("NOT_FOUND", "Profile not found", 404);
    }

    throw error;
  }
}

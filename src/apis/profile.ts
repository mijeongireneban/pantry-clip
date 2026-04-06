import type {
  ProfileDto,
  UpdateProfileRequest
} from "@/src/apis/@types/profile";
import type { ApiErrorResponse } from "@/src/apis/@types/recipes";
import { APP_CONFIG } from "@/src/config/app";
import { getSupabaseBrowserClient } from "@/src/lib/auth/supabase-client";

async function toErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const error = (await response.json()) as ApiErrorResponse;
    return error.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getProfile(options?: { signal?: AbortSignal }) {
  const response = await fetch("/api/profile", {
    signal: options?.signal
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to load profile."));
  }

  return (await response.json()) as ProfileDto;
}

export async function updateProfile(payload: UpdateProfileRequest) {
  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to update profile."));
  }

  return (await response.json()) as ProfileDto;
}

export async function uploadProfileAvatar(userId: string, file: Blob) {
  const supabase = getSupabaseBrowserClient();
  const objectPath = `users/${userId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(APP_CONFIG.avatarBucketName)
    .upload(objectPath, file, {
      cacheControl: "3600",
      contentType: "image/webp",
      upsert: false
    });

  if (error) {
    throw new Error(
      error.message || "Failed to upload avatar. Check your storage bucket setup."
    );
  }

  const { data } = supabase.storage
    .from(APP_CONFIG.avatarBucketName)
    .getPublicUrl(objectPath);

  if (!data.publicUrl) {
    throw new Error("Avatar uploaded, but no public URL was returned.");
  }

  return data.publicUrl;
}

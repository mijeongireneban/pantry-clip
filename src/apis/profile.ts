import type {
  ProfileDto,
  UpdateProfileRequest
} from "@/src/apis/@types/profile";
import type { ApiErrorResponse } from "@/src/apis/@types/recipes";

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

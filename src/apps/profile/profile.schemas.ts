import { z } from "zod";

const usernamePattern = /^[a-z0-9._]{3,24}$/;
const dataImagePattern = /^data:image\/(?:png|jpe?g|webp|gif);base64,/i;

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isSupportedAvatarValue(value: string) {
  return isHttpUrl(value) || dataImagePattern.test(value);
}

export const profileUsernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(24)
  .regex(
    usernamePattern,
    "Use 3-24 lowercase letters, numbers, periods, or underscores."
  );

export const profileAvatarUrlSchema = z
  .string()
  .trim()
  .max(400_000)
  .refine((value) => value === "" || isSupportedAvatarValue(value), {
    message: "Enter a valid image URL or upload an image file."
  });

export const updateProfileSchema = z.object({
  username: profileUsernameSchema,
  avatarUrl: profileAvatarUrlSchema
});

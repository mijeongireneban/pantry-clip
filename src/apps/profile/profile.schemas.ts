import { z } from "zod";

const usernamePattern = /^[a-z0-9._]{3,24}$/;

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
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
  .max(500)
  .refine((value) => value === "" || isHttpUrl(value), {
    message: "Enter a valid image URL starting with http:// or https://."
  });

export const updateProfileSchema = z.object({
  username: profileUsernameSchema,
  avatarUrl: profileAvatarUrlSchema
});

export const APP_CONFIG = {
  appName: "PantryClip",
  avatarBucketName:
    process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET?.trim() || "avatars"
} as const;

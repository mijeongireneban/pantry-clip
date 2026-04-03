export function extractYouTubeVideoId(sourceUrl: string) {
  try {
    const parsed = new URL(sourceUrl);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host.includes("youtube.com")) {
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (shortsMatch?.[1]) return shortsMatch[1];

      const watchId = parsed.searchParams.get("v");
      if (watchId) return watchId;

      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?#]+)/);
      if (embedMatch?.[1]) return embedMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

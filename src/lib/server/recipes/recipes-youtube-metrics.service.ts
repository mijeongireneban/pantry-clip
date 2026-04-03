import { ApiError } from "@/src/lib/utils/api-error";

type YouTubeVideoMetrics = {
  viewCount: number | null;
  likeCount: number | null;
};

type CacheEntry = {
  expiresAt: number;
  metrics: YouTubeVideoMetrics;
};

const YOUTUBE_VIDEOS_BATCH_SIZE = 50;
const YOUTUBE_METRICS_CACHE_TTL_MS = 1000 * 60 * 60;

declare global {
  var __pantryClipYouTubeMetricsCache: Map<string, CacheEntry> | undefined;
}

function getMetricsCache() {
  if (!globalThis.__pantryClipYouTubeMetricsCache) {
    globalThis.__pantryClipYouTubeMetricsCache = new Map();
  }

  return globalThis.__pantryClipYouTubeMetricsCache;
}

function chunkVideoIds(videoIds: string[]) {
  const chunks: string[][] = [];

  for (
    let index = 0;
    index < videoIds.length;
    index += YOUTUBE_VIDEOS_BATCH_SIZE
  ) {
    chunks.push(videoIds.slice(index, index + YOUTUBE_VIDEOS_BATCH_SIZE));
  }

  return chunks;
}

function toMetricValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getYouTubeVideoMetrics(videoIds: string[]) {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;

  if (!apiKey || videoIds.length === 0) {
    return new Map<string, YouTubeVideoMetrics>();
  }

  const cache = getMetricsCache();
  const now = Date.now();
  const uniqueVideoIds = [...new Set(videoIds)];
  const uncachedVideoIds: string[] = [];
  const metricsByVideoId = new Map<string, YouTubeVideoMetrics>();

  for (const videoId of uniqueVideoIds) {
    const cached = cache.get(videoId);

    if (cached && cached.expiresAt > now) {
      metricsByVideoId.set(videoId, cached.metrics);
      continue;
    }

    uncachedVideoIds.push(videoId);
  }

  for (const batch of chunkVideoIds(uncachedVideoIds)) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "statistics");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new ApiError(
        "INTERNAL_ERROR",
        "Failed to load YouTube video metrics.",
        502
      );
    }

    const payload = (await response.json()) as {
      items?: Array<{
        id: string;
        statistics?: {
          viewCount?: string;
          likeCount?: string;
        };
      }>;
    };

    for (const item of payload.items ?? []) {
      const metrics = {
        viewCount: toMetricValue(item.statistics?.viewCount),
        likeCount: toMetricValue(item.statistics?.likeCount)
      };

      cache.set(item.id, {
        metrics,
        expiresAt: now + YOUTUBE_METRICS_CACHE_TTL_MS
      });
      metricsByVideoId.set(item.id, metrics);
    }
  }

  return metricsByVideoId;
}

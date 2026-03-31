export const summarizeJobStages = [
  "queued",
  "extracting_metadata",
  "extracting_subtitles",
  "downloading_media",
  "transcribing_audio",
  "extracting_frames",
  "analyzing_frames",
  "summarizing",
  "completed",
  "insufficient_context",
  "failed"
] as const;

export type SummarizeJobStage = (typeof summarizeJobStages)[number];

export const summarizeJobFailureKinds = [
  "source_rate_limited",
  "source_unavailable",
  "media_download_failed",
  "transcription_failed",
  "vision_failed",
  "insufficient_context",
  "internal_error"
] as const;

export type SummarizeJobFailureKind = (typeof summarizeJobFailureKinds)[number];

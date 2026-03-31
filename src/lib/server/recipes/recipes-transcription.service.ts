import OpenAI, { toFile } from "openai";

import type { DownloadedRecipeAudio } from "@/src/lib/server/recipes/recipes-youtube-audio.service";

const DEFAULT_TRANSCRIPTION_MODEL = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-transcribe";

function hasHangul(text: string): boolean {
  return /[가-힣]/.test(text);
}

export async function transcribeRecipeAudio(
  audio: DownloadedRecipeAudio,
  hints: { title?: string; description?: string } = {}
): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const hintText = `${hints.title ?? ""} ${hints.description ?? ""}`.trim();
  const language = hasHangul(hintText) ? "ko" : undefined;
  const file = await toFile(audio.buffer, audio.fileName, {
    type: audio.mimeType
  });
  const transcription = await client.audio.transcriptions.create(
    {
      file,
      model: DEFAULT_TRANSCRIPTION_MODEL,
      language,
      prompt: language === "ko"
        ? "한국어 요리 영상 음성을 정확히 받아쓰기 하세요. 음식 이름, 재료명, 양념명, 조리 단계를 가능한 그대로 적으세요."
        : undefined,
      response_format: "json",
      temperature: 0
    },
    { timeout: 30000 }
  );

  return transcription.text.trim();
}

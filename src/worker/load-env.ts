import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ENV_FILE_ORDER = [".env", ".env.local"] as const;

function parseEnvValue(rawValue: string): string {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

function parseEnvFile(contents: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const normalized = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length)
      : trimmed;
    const separatorIndex = normalized.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    const rawValue = normalized.slice(separatorIndex + 1);

    if (!key) {
      continue;
    }

    parsed[key] = parseEnvValue(rawValue);
  }

  return parsed;
}

export function loadWorkerEnv(cwd: string = process.cwd()): void {
  const preexistingKeys = new Set(Object.keys(process.env));

  for (const fileName of ENV_FILE_ORDER) {
    const filePath = path.join(cwd, fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    const parsed = parseEnvFile(readFileSync(filePath, "utf8"));

    for (const [key, value] of Object.entries(parsed)) {
      if (preexistingKeys.has(key)) {
        continue;
      }

      process.env[key] = value;
    }
  }
}

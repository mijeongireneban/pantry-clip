import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { ApiError, toErrorResponse } from "@/src/lib/utils/api-error";

const ASSET_TYPES = {
  "swagger-ui-bundle.js": "application/javascript; charset=utf-8",
  "swagger-ui-standalone-preset.js": "application/javascript; charset=utf-8"
} as const;

type AssetName = keyof typeof ASSET_TYPES;

function isAssetName(value: string): value is AssetName {
  return value in ASSET_TYPES;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ asset: string }> }
) {
  try {
    const { asset } = await context.params;

    if (!isAssetName(asset)) {
      throw new ApiError("NOT_FOUND", "Asset not found", 404);
    }

    const filePath = path.join(process.cwd(), "node_modules", "swagger-ui-dist", asset);
    const body = await readFile(filePath, "utf8");

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": ASSET_TYPES[asset],
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}

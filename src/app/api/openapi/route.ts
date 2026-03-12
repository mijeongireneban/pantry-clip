import { NextResponse } from "next/server";

import { getOpenApiSpec } from "@/src/lib/server/openapi/openapi.spec";

export async function GET() {
  return NextResponse.json(getOpenApiSpec(), { status: 200 });
}

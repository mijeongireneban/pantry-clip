import { NextResponse } from "next/server";
import { getHealthStatus } from "@/src/lib/server/health/health.service";

export async function GET() {
  const status = getHealthStatus();
  return NextResponse.json(status, { status: 200 });
}

export type HealthStatus = {
  ok: true;
  service: string;
  timestamp: string;
  uptimeSec: number;
};

export function getHealthStatus(): HealthStatus {
  return {
    ok: true,
    service: "pantry-clip-api",
    timestamp: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime())
  };
}

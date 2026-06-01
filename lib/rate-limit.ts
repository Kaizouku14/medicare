const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - entry.count };
}

export function rateLimitKey(req: Request, suffix?: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return `${ip}:${suffix ?? "global"}`;
}

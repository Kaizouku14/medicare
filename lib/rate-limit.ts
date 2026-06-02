import { checkRateLimit } from "@vercel/firewall";

const localRateMap = new Map<string, { count: number; resetAt: number }>();
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer !== null) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of localRateMap) {
      if (now > entry.resetAt) {
        localRateMap.delete(key);
      }
    }
    if (localRateMap.size === 0 && cleanupTimer !== null) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL_MS);
  if (typeof cleanupTimer?.unref === "function") {
    cleanupTimer.unref();
  }
}

type RateLimitOptions = {
  request: Request;
  limit?: number;
  windowMs?: number;
  rateLimitKey?: string;
};

export async function rateLimit(
  rateLimitId: string,
  options: RateLimitOptions,
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const result = await checkRateLimit(rateLimitId, {
      request: options.request,
      rateLimitKey: options.rateLimitKey,
    });
    if (result && "rateLimited" in result) {
      return { allowed: !result.rateLimited, remaining: result.rateLimited ? 0 : 999 };
    }
  } catch {
    // checkRateLimit not available (local dev) — fall through to in-memory fallback
  }

  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60_000;
  const forwarded = options.request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const key = `${ip}:${rateLimitId}`;

  const now = Date.now();
  const entry = localRateMap.get(key);

  if (!entry || now > entry.resetAt) {
    localRateMap.set(key, { count: 1, resetAt: now + windowMs });
    startCleanup();
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - entry.count };
}

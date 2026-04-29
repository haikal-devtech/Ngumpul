/**
 * In-memory sliding-window rate limiter.
 *
 * Usage:
 *   const { success, remaining } = rateLimit(identifier, { limit: 10, windowMs: 60_000 });
 *   if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
 */

interface RateLimitOptions {
  limit: number;     // max requests per window
  windowMs: number;  // window size in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // unix ms when the window resets
}

// Global store — persists across requests within the same serverless instance
const store = new Map<string, number[]>();

export function rateLimit(
  identifier: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = store.get(identifier) ?? [];
  // Prune old timestamps outside the current window
  const recent = timestamps.filter((ts) => ts > windowStart);

  if (recent.length >= limit) {
    // Sort ascending so oldest is first
    recent.sort((a, b) => a - b);
    const resetAt = recent[0] + windowMs;
    return { success: false, remaining: 0, resetAt };
  }

  recent.push(now);
  store.set(identifier, recent);

  // Prevent unbounded memory growth: evict entries after 10 minutes of inactivity
  if (store.size > 10_000) {
    const cutoff = now - 10 * 60_000;
    for (const [key, ts] of store.entries()) {
      if (ts.every((t) => t < cutoff)) store.delete(key);
    }
  }

  return { success: true, remaining: limit - recent.length, resetAt: now + windowMs };
}

/**
 * Extract a stable identifier from a Next.js request.
 * Uses X-Forwarded-For (set by Vercel) falling back to a constant.
 */
export function getClientIp(req: Request): string {
  const xff = (req.headers as any).get?.("x-forwarded-for") ??
    (req.headers as any)["x-forwarded-for"] ?? "";
  const ip = (typeof xff === "string" ? xff.split(",")[0] : "") || "unknown";
  return ip.trim();
}

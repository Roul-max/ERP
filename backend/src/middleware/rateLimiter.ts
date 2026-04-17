import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";

const toInt = (value: unknown, fallback: number) => {
  const n = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const isProd = process.env.NODE_ENV === "production";

// In local development the UI can make many parallel calls (and React dev-mode may re-run effects),
// so keep a much higher limit by default. Override via env if needed.
const windowMs = toInt(
  process.env.RATE_LIMIT_WINDOW_MS,
  isProd ? 15 * 60 * 1000 : 60 * 1000
);
const max = toInt(process.env.RATE_LIMIT_MAX, isProd ? 100 : 5000);
const enabled = (process.env.RATE_LIMIT_ENABLED || "true").toLowerCase() !== "false";

const noop: RequestHandler = (_req, _res, next) => next();

export const limiter: RequestHandler = enabled
  ? rateLimit({
      windowMs,
      max,
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      handler: (req, res) => {
        const rl = (req as any).rateLimit as
          | { resetTime?: Date; limit?: number; current?: number; remaining?: number }
          | undefined;

        const resetTimeMs =
          rl?.resetTime instanceof Date ? rl.resetTime.getTime() : undefined;
        const retryAfterSeconds =
          resetTimeMs && resetTimeMs > Date.now()
            ? Math.max(1, Math.ceil((resetTimeMs - Date.now()) / 1000))
            : undefined;

        if (retryAfterSeconds) {
          res.setHeader("Retry-After", String(retryAfterSeconds));
        }

        res.status(429).json({
          message: "Too many requests. Please slow down and try again shortly.",
          retryAfterSeconds,
          limit: rl?.limit,
          current: rl?.current,
          remaining: rl?.remaining,
        });
      },
    })
  : noop;

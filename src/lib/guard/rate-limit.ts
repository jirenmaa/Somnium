import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "./upstash";
import { ThrowNewError, logger } from "../utils";

export type ActionResult<T> = ActionResultType;

/**
 * Check if rate limiting is disabled for development
 * Disabled via DISABLE_RATE_LIMIT env var or automatically in development environment or
 */
function isRateLimitDisabled(): boolean {
  return process.env.DISABLE_RATE_LIMIT === "true";
}

export interface ActionOptions {
  /**
   * Whether to require authentication
   * @default true
   */
  requireAuth?: boolean;

  /**
   * Whether to enforce rate limiting
   * @default true
   */
  rateLimit?: boolean;

  /**
   * Action name for logging
   */
  name?: string;

  /**
   * Custom rate limit key (default: user ID or IP)
   */
  rateLimitKey?: string;
}

export interface ApiRateLimitOptions {
  /**
   * Maximum requests per time window
   * @default 10
   */
  maxRequests?: number;

  /**
   * Time window in seconds
   * @default 3600 (1 hour)
   */
  windowSeconds?: number;

  /**
   * Custom identifier (default: IP address)
   */
  identifier?: string;

  /**
   * Action name for logging
   */
  name?: string;
}

/**
 * Enforces rate limiting based on user ID or IP address
 * Uses Upstash Redis for distributed rate limiting
 * Disabled in development environment or when DISABLE_RATE_LIMIT=true
 */
export async function enforceRateLimit(customKey?: string) {
  // Skip rate limiting in development
  if (isRateLimitDisabled()) {
    logger.debug("Rate limiting disabled - skipping check");
    return;
  }

  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();

  // Use user_id as identifier, then IP as fallback, then anonymous
  const identifier = customKey ?? session?.user?.id ?? ip ?? "anonymous";

  const { success, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    logger.warn(`Rate limit exceeded for identifier: ${identifier}`);
    ThrowNewError("Too many requests. Please slow down.", "server", 429);
  }

  logger.debug(
    `Rate limit check passed for identifier: ${identifier}, remaining: ${remaining}`,
  );
}

/**
 * Retrieves the current session and validates authentication
 * @throws Error if authentication required but not found
 */
export async function getAuthenticatedSession(requireAuth: boolean = true) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (requireAuth && !session?.user) {
    ThrowNewError("Authentication required", "server", 401);
  }

  return session;
}

/**
 * Higher-order function that wraps server actions with:
 * - Authentication checks
 * - Rate limiting
 * - Error handling
 * - Request logging
 *
 * @example
 * export const myAction = withAction(
 *   async (input) => { return result; },
 *   { requireAuth: true, name: 'myAction' }
 * )
 */
export function withAction<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  options: ActionOptions = {},
): (...args: A) => Promise<ActionResult<T>> {
  const {
    requireAuth = true,
    rateLimit = true,
    name = fn.name || "action",
    rateLimitKey,
  } = options;

  return async (...args: A): Promise<ActionResult<T>> => {
    const startTime = Date.now();

    try {
      // Enforce rate limiting if enabled
      if (rateLimit) {
        logger.debug(`Rate limiting disabled for ${name} - skipping check`);
        await enforceRateLimit(rateLimitKey);
      }

      logger.debug(`Starting action: ${name}`, { args });

      // Validate authentication if required
      const session = await getAuthenticatedSession(requireAuth);

      // Execute the action
      const data = await fn(...args);

      const duration = Date.now() - startTime;
      logger.info(`Action completed: ${name}`, {
        duration,
        userId: session?.user?.id,
      });

      return { data };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Extract error details
      const message = error?.message ?? "Unexpected server error";
      const status = error?.statusCode ?? 500;
      const type = error?.type ?? "server";

      logger.error(`Action failed: ${name}`, {
        error: message,
        status,
        duration,
        stack: error?.stack,
      });

      return {
        error: {
          message,
          status,
          type: type as PageErrorType,
        },
      };
    }
  };
}

/**
 * Middleware for API routes to enforce rate limiting
 * Returns a 429 response if rate limit exceeded
 *
 * @example
 * export const POST = withApiRateLimit(
 *   async (req) => {
 *     // handler code
 *     return NextResponse.json(data);
 *   },
 *   { maxRequests: 5, windowSeconds: 900, name: "login" }
 * );
 */
export function withApiRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  options: ApiRateLimitOptions = {},
) {
  const {
    maxRequests = 10,
    windowSeconds = 3600,
    identifier,
    name = handler.name || "api-handler",
  } = options;

  return async (req: NextRequest): Promise<Response> => {
    try {
      // Skip rate limiting in development
      if (isRateLimitDisabled()) {
        logger.debug(`Rate limiting disabled for ${name} - skipping check`);
        return await handler(req);
      }

      const requestHeaders = await headers();
      const forwarded = requestHeaders.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim();

      // Use custom identifier or IP
      const key = identifier ?? ip ?? "anonymous";

      // Create a custom Ratelimit instance for this endpoint
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");

      const limiter = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds}s`),
        analytics: true,
        prefix: `@upstash/ratelimit:${name}`,
      });

      const { success, remaining } = await limiter.limit(key);

      if (!success) {
        logger.warn(`Rate limit exceeded for ${name}`, { ip, key });

        return NextResponse.json(
          {
            error: "Too many requests. Please try again later.",
            retryAfter: windowSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": windowSeconds.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
            },
          },
        );
      }

      logger.debug(`Rate limit check passed for ${name}`, {
        ip,
        remaining,
      });

      // Call the actual handler
      return await handler(req);
    } catch (error: any) {
      logger.error(`API handler error in ${name}`, {
        error: error?.message,
        stack: error?.stack,
      });

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

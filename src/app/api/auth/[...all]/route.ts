import { NextRequest } from "next/server";

import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/server";
import { withApiRateLimit } from "@/lib/guard/rate-limit";

export const authHandler = toNextJsHandler(auth.handler);

export const { GET } = authHandler;

// Limit login/logout attempts: 5 attempts per 15 minutes
export const POST = withApiRateLimit(
  authHandler.POST,
  {
    maxRequests: 5,
    windowSeconds: 300, // 5 minutes
    name: "auth-login-logout",
  }
);

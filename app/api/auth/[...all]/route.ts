import { NextRequest } from "next/server";

import { toNextJsHandler } from "better-auth/next-js";
import { findIp } from "@arcjet/ip";
import { ArcjetDecision, slidingWindow, validateEmail } from "@arcjet/next";

import { auth } from "@/lib/auth";
import aj from "@/lib/arcjet";

const emailValidation = aj.withRule(
  validateEmail({
    mode: "LIVE",
    deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
  }),
);

const rateLimit = aj.withRule(
  slidingWindow({
    mode: "LIVE",
    interval: "2m",
    max: 2,
    characteristics: ["fingerprint"],
  }),
);

const protectedAuth = async (req: NextRequest): Promise<ArcjetDecision> => {
  const session = await auth.api.getSession({ headers: req.headers });

  let userId: string;

  if (session?.user?.id) userId = session.user.id;
  else {
    userId = findIp(req) || "127.0.0.1";
  }

  if (req.nextUrl.pathname.startsWith("/api/auth/sign-in")) {
    const body = await req.clone().json();

    if (typeof body.email === "string") {
      return emailValidation.protect(req, { email: body.email });
    }
  }

  return rateLimit.protect(req, { fingerprint: userId });
};

export const authHandler = toNextJsHandler(auth.handler);

export const { GET } = authHandler;
export const POST = async (req: NextRequest) => {
  const decision = await protectedAuth(req);

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      throw new Error("Email validation failed");
    }

    if (decision.reason.isRateLimit()) {
      throw new Error("Rate Limit exceeded");
    }

    if (decision.reason.isShield()) {
      throw new Error("Shiled turned on, protected agains malicious actions");
    }
  }

  return authHandler.POST(req);
};

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { fixedWindow, request } from "@arcjet/next";
import { db } from "@/drizzle/db";
import { user, videos } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

import { auth } from "../auth";
import aj from "../arcjet";

export const getSessionUserId = async (): Promise<string> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Unauthenticated");

  return session.user.id;
};

export const revalidatePaths = (paths: string[]) => {
  paths.forEach((path) => revalidatePath(path));
};

export const validateWithArcjet = async (fingerprint: string) => {
  const rateLimit = aj.withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 2,
      characteristics: ["fingerprint"],
    }),
  );

  const req = await request();

  const decision = await rateLimit.protect(req, { fingerprint });

  if (decision.isDenied()) {
    throw new Error("Rate Limit Exceeded");
  }
};

export const buildVideoWithUserQuery = () => {
  return db
    .select({
      video: videos,
      user: { id: user.id, name: user.name, image: user.image },
    })
    .from(videos)
    .leftJoin(user, eq(videos.userId, user.id));
};

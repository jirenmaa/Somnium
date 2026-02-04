import { headers } from "next/headers";

import { db } from "@/drizzle/db";
import { user, videos } from "@/drizzle/schema";
import { and, eq, ilike, desc } from "drizzle-orm";

import { auth } from "../auth";
import {
  getOrderByClause,
  withErrorHandling,
} from "../utils";
import { buildVideoWithUserQuery } from "./helper";

export const getUserStudioData = withErrorHandling(
  async (searchQuery: string = "", sortFilter?: string) => {
    const userId = (
      await auth.api.getSession({ headers: await headers() })
    )?.user.id;
    
    if (!userId) throw new Error("Unauthorized");

    const [userInfo] = await db
      .select({id: user.id})
      .from(user)
      .where(eq(user.id, userId));

    if (!userInfo) throw new Error("User not found");

    const conditions = [
      eq(videos.userId, userId),
      searchQuery.trim() && ilike(videos.title, `%${searchQuery}%`),
    ].filter(Boolean) as any[];

    const userVideos = await buildVideoWithUserQuery()
      .where(and(...conditions))
      .orderBy(
        sortFilter ? getOrderByClause(sortFilter) : desc(videos.createdAt),
      );

    return { videos: userVideos, count: userVideos.length };
  },
);

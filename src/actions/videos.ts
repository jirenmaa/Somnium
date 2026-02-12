"use server";

import { and, eq, sql, inArray } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import { video, user } from "@/db/schema";
import { withAction } from "@/lib/guard/rate-limit";
import { updateVideoSchema } from "../lib/validator";
import {
  requireAuth,
  getOptionalAuth,
  validateOwnership,
  validateArrayOwnership,
  logger as securityLogger,
} from "@/lib/guard/security";
import { ThrowNewError } from "@/lib/utils";

/**
 * Creates a new video with ownership validation
 * @param input Video creation input with user ID validation
 * @returns Created video object
 */
export const createVideo = withAction(
  async (input: CreateVideoInput) => {
    const session = await requireAuth();

    // Validate input ownership
    if (input.userId !== session!.user.id) {
      securityLogger.security("Unauthorized video creation attempt", {
        requestedUserId: input.userId,
        currentUserId: session!.user.id,
      });
      ThrowNewError("Cannot create video for another user", "server", 403);
    }

    const [created] = await db
      .insert(video)
      .values({
        title: input.title,
        description: input.description,
        visibility: input.visibility,
        userId: input.userId,

        videoUrl: input.video.url,
        videoId: input.video.id,
        duration: input.video.duration,

        thumbnailUrl: input.thumbnail.url,
        thumbnailId: input.thumbnail.id,
      })
      .returning({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        visibility: video.visibility,
      });

    securityLogger.info(`Video created successfully`, {
      videoId: created.id,
      userId: session!.user.id,
    });

    return created;
  },
  { name: "createVideo" },
);

/**
 * Fetches a single video with visibility and ownership checks
 * @param videoId The video ID to fetch
 * @returns Video object or error response
 */
export const getVideoById = withAction(
  async (videoId: string) => {
    if (!videoId || videoId.trim().length === 0) {
      ThrowNewError("Valid video ID is required", "server", 400);
    }

    const session = await getOptionalAuth();
    const userId = session?.user?.id;

    // Fetch video
    const rows = await db
      .select({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        visibility: video.visibility,
        views: video.views,
        duration: video.duration,
        createdAt: video.createdAt,
        userId: video.userId,
        user: {
          id: user.id,
          name: user.name,
          displayUsername: user.displayUsername,
          image: user.image,
        },
      })
      .from(video)
      .leftJoin(user, eq(video.userId, user.id))
      .where(eq(video.id, videoId))
      .limit(1);

    const videoData = rows[0];

    // Not found
    if (!videoData) {
      return {
        message: "Video not found",
        type: "notFound",
      };
    }

    // Visibility checks
    const isOwner = userId && videoData.userId === userId;
    const isPrivate = videoData.visibility === "private";

    if (isPrivate && !isOwner) {
      securityLogger.security("Unauthorized video access attempt", {
        videoId,
        userId,
        videoVisibility: videoData.visibility,
      });
      return {
        message: "Video is privated by the user",
        type: "private",
      };
    }

    return videoData as VideoItem;
  },
  { requireAuth: false, name: "getVideoById" },
);

/**
 * Fetches paginated public videos with search and sorting
 * @param searchQuery Search term for video titles
 * @param sortFilter Sort order (latest, oldest, views)
 * @param pageNumber Current page number
 * @param pageSize Items per page (max 100)
 * @param currentUserId If provided, fetches user's private videos (authorized users only)
 * @returns Array of videos
 */
export const getVideos = withAction(
  async (
    searchQuery: string = "",
    sortFilter?: string,
    pageNumber: number = 1,
    pageSize: number = 8,
    requestedUserId?: string,
  ) => {
    // Validate pagination params
    if (pageNumber < 1 || pageSize < 1 || pageSize > 100) {
      ThrowNewError("Invalid pagination parameters", "server", 400);
    }

    let whereCondition;

    // Profile mode (authenticated user only)
    if (requestedUserId) {
      const session = await requireAuth();

      const isOwner = session?.user.id === requestedUserId;

      if (isOwner) {
        // Owner sees all their videos
        whereCondition = eq(video.userId, requestedUserId);
      } else {
        // Other users see only public videos
        whereCondition = and(
          eq(video.userId, requestedUserId),
          eq(video.visibility, "public"),
        );
      }
    } else {
      // Homepage mode - public videos only
      whereCondition = eq(video.visibility, "public");
    }

    // Search with ILIKE (case-insensitive)
    if (searchQuery.trim().length > 0) {
      const sanitizedQuery = searchQuery.trim().slice(0, 100);
      const search = sql`${video.title} ILIKE ${"%" + sanitizedQuery + "%"}`;
      whereCondition = and(whereCondition, search) || whereCondition;
    }

    // Sorting
    const orderByClause = (() => {
      switch (sortFilter) {
        case "views":
          return sql`${video.views} DESC`;
        case "oldest":
          return sql`${video.createdAt} ASC`;
        case "latest":
        default:
          return sql`${video.createdAt} DESC`;
      }
    })();

    const rows = await db
      .select({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        visibility: video.visibility,
        views: video.views,
        duration: video.duration,
        createdAt: video.createdAt,

        user: {
          id: user.id,
          name: user.name,
          displayUsername: user.displayUsername,
          image: user.image,
        },
      })
      .from(video)
      .innerJoin(user, eq(video.userId, user.id))
      .where(whereCondition)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    return rows;
  },
  { requireAuth: false, name: "getVideos" },
);

/**
 * Fetches the authenticated user's total videos
 */
export const getMyVideosCount = withAction(async () => {
  const session = await requireAuth();

  let whereCondition = eq(video.userId, session!.user.id);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(video)
    .where(whereCondition);

  return {
    total: Number(total[0].count),
  };
});

/**
 * Fetches the authenticated user's videos
 * @param searchQuery Search term
 * @param sortFilter Sort order
 * @param pageNumber Current page
 * @param pageSize Items per page
 * @returns User's videos
 */
export const getMyVideos = withAction(
  async (
    searchQuery?: string,
    sortFilter?: string,
    pageNumber: number = 1,
    pageSize: number = 8,
  ) => {
    const session = await requireAuth();

    // Validate pagination
    if (pageNumber < 1 || pageSize < 1 || pageSize > 100) {
      ThrowNewError("Invalid pagination parameters", "server", 400);
    }

    let whereCondition = eq(video.userId, session!.user.id);

    // Search
    if (searchQuery && searchQuery.trim().length > 0) {
      const sanitizedQuery = searchQuery.trim().slice(0, 100);
      const search = sql`${video.title} ILIKE ${"%" + sanitizedQuery + "%"}`;
      whereCondition = and(whereCondition, search) || whereCondition;
    }

    // Sorting
    const orderByClause = (() => {
      switch (sortFilter) {
        case "views":
          return sql`${video.views} DESC`;
        case "oldest":
          return sql`${video.createdAt} ASC`;
        case "latest":
        default:
          return sql`${video.createdAt} DESC`;
      }
    })();

    const rows = await db
      .select({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        thumbnailId: video.thumbnailId,
        visibility: video.visibility,
        views: video.views,
        duration: video.duration,
        createdAt: video.createdAt,

        user: {
          id: user.id,
          name: user.name,
          displayUsername: user.displayUsername,
          image: user.image,
        },
      })
      .from(video)
      .innerJoin(user, eq(video.userId, user.id))
      .where(whereCondition)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    return rows;
  },
  { name: "getMyVideos" },
);

/**
 * Updates video visibility with ownership validation
 * @param input Video ID and new visibility setting
 * @returns Updated video
 */
export const updateVideoVisibility = withAction(
  async (input: z.infer<typeof updateVideoSchema>) => {
    const session = await requireAuth();

    const parsed = updateVideoSchema.parse(input);

    // Verify ownership
    const existing = await db
      .select({ id: video.id, userId: video.userId })
      .from(video)
      .where(eq(video.id, parsed.videoId))
      .limit(1);

    if (existing.length === 0) {
      ThrowNewError("Video not found", "notFound", 404);
    }

    validateOwnership(existing[0].userId, session!.user.id);

    const [updated] = await db
      .update(video)
      .set({
        visibility: parsed.visibility,
        updatedAt: new Date(),
      })
      .where(eq(video.id, parsed.videoId))
      .returning();

    securityLogger.info(`Video visibility updated`, {
      videoId: parsed.videoId,
      newVisibility: parsed.visibility,
      userId: session!.user.id,
    });

    return updated;
  },
  { name: "updateVideoVisibility" },
);

/**
 * Deletes one or more videos with ownership validation
 * @param videoIds Array of video IDs to delete
 * @returns Deletion result with count
 */
export const deleteVideos = withAction(
  async (videoIds: string[]) => {
    const session = await requireAuth();

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      ThrowNewError("No video IDs provided", "server", 400);
    }

    if (videoIds.length > 10) {
      securityLogger.security("Too many videos requested for deletion", {
        count: videoIds.length,
        userId: session!.user.id,
      });
      ThrowNewError("Cannot delete more than 10 videos at once", "server", 400);
    }

    // Ensure all videos belong to the user
    const ownedVideos = await db
      .select({ id: video.id, userId: video.userId })
      .from(video)
      .where(inArray(video.id, videoIds));

    const ownedIds = ownedVideos
      .filter((v) => v.userId === session!.user.id)
      .map((v) => v.id);

    if (ownedIds.length === 0) {
      securityLogger.security("Unauthorized video deletion attempt", {
        requestedIds: videoIds,
        userId: session!.user.id,
      });
      ThrowNewError(
        "You do not have permission to delete these videos",
        "server",
        403,
      );
    }

    // Delete only owned videos
    await db.delete(video).where(inArray(video.id, ownedIds));

    securityLogger.info(`Videos deleted successfully`, {
      count: ownedIds.length,
      userId: session!.user.id,
    });

    return {
      success: true,
      deletedCount: ownedIds.length,
    };
  },
  { name: "deleteVideos" },
);

"use server";

import { headers } from "next/headers";

import { db } from "@/drizzle/db";
import { user, videos } from "@/drizzle/schema";
import { and, eq, ilike, or, sql, desc } from "drizzle-orm";

import { BUNNY } from "@/constants";
import {
  getSessionUserId,
  revalidatePaths,
  validateWithArcjet,
  buildVideoWithUserQuery,
} from "./helper";
import { auth } from "../auth";
import {
  apiFetch,
  doesTitleMatch,
  getEnv,
  getOrderByClause,
  withErrorHandling,
} from "../utils";

const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL;
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL;
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL;
const BUNNY_LIBRARY_ID = getEnv("BUNNY_LIBRARY_ID");
const ACCESS_KEYS = {
  streamAccessKey: getEnv("BUNNY_STREAM_ACCESS_KEY"),
  storageAccessKey: getEnv("BUNNY_STORAGE_ACCESS_KEY"),
};

export const getVideoUploadUrl = withErrorHandling(async () => {
  await getSessionUserId();

  const videoResponse = await apiFetch<BunnyVideoResponse>(
    `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: "POST",
      bunnyType: "stream",
      body: { title: "Temp Title", collectionId: "" },
    },
  );

  const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`;

  return {
    videoId: videoResponse.guid,
    uploadUrl,
    accessKey: ACCESS_KEYS.streamAccessKey,
  };
});

export const getThumbnailUploadUrl = withErrorHandling(
  async (videoId: string) => {
    const filename = `${Date.now()}-${videoId}-thumbnail`;

    const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${filename}`;
    const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${filename}`;

    return {
      uploadUrl,
      cdnUrl,
      accessKey: ACCESS_KEYS.storageAccessKey,
    };
  },
);

export const saveVideoDetails = withErrorHandling(
  async (videoDetails: VideoDetails) => {
    const userId = await getSessionUserId();

    await validateWithArcjet(userId);

    await apiFetch(
      `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
      {
        method: "POST",
        bunnyType: "stream",
        body: {
          title: videoDetails.title,
          description: videoDetails.description,
        },
      },
    );

    const visibility = (
      ["private", "public"].includes(videoDetails.visibility)
        ? videoDetails.visibility
        : "private"
    ) as "private" | "public";

    await db.insert(videos).values({
      ...videoDetails,
      visibility: visibility,
      videoUrl: `${BUNNY.EMBED_URL}/${BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePaths(["/"]);

    return { videoId: videoDetails.videoId };
  },
);

export const getInfiniteVideos = withErrorHandling(
  async (
    searchQuery: string = "",
    sortFilter?: string,
    pageNumber: number = 1,
    pageSize: number = 8,
  ) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const currentUserId = session?.user?.id;

    const canSeeTheVideo = or(
      eq(videos.visibility, "public"),
      eq(videos.userId, currentUserId!),
    );

    const whereCondition = searchQuery.trim()
      ? and(canSeeTheVideo, doesTitleMatch(videos, searchQuery))
      : canSeeTheVideo;

    const videoRecords = await buildVideoWithUserQuery()
      .where(whereCondition)
      .orderBy(
        sortFilter
          ? getOrderByClause(sortFilter)
          : sql`${videos.createdAt} DESC`,
      )
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    return videoRecords;
  },
);

export const getVideoById = withErrorHandling(async (videoId: string) => {
  const [videoRecord] = await buildVideoWithUserQuery().where(
    eq(videos.id, videoId),
  );

  return videoRecord;
});

export const getAllVideosByUser = withErrorHandling(
  async (
    userIdParameter: string,
    searchQuery: string = "",
    sortFilter?: string,
  ) => {
    const currentUserId = (
      await auth.api.getSession({ headers: await headers() })
    )?.user.id;
    const isOwner = userIdParameter === currentUserId;

    const [userInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, userIdParameter));

    if (!userInfo) throw new Error("User not found");

    const conditions = [
      eq(videos.userId, userIdParameter),
      !isOwner && eq(videos.visibility, "public"),
      searchQuery.trim() && ilike(videos.title, `%${searchQuery}%`),
    ].filter(Boolean) as any[];

    const userVideos = await buildVideoWithUserQuery()
      .where(and(...conditions))
      .orderBy(
        sortFilter ? getOrderByClause(sortFilter) : desc(videos.createdAt),
      );

    return { user: userInfo, videos: userVideos, count: userVideos.length };
  },
);

export const updateVideoVisibility = withErrorHandling(
  async (videoId: string, videoVisibility: Visibility) => {
    await validateWithArcjet(videoId);

    const visibility = (
      ["private", "public"].includes(videoVisibility)
        ? videoVisibility
        : "private"
    ) as "private" | "public";

    await db
      .update(videos)
      .set({ visibility: visibility, updatedAt: new Date() })
      .where(eq(videos.videoId, videoId));

    return {
      success: true,
      message: "Video updated successfully",
    };
  },
);

export const getVideoProcessingStatus = withErrorHandling(
  async (videoId: string) => {
    const streamUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`;

    const processingInfo = await apiFetch<BunnyVideoResponse>(streamUrl, {
      bunnyType: "stream",
    });

    return {
      isProcessed: processingInfo.status === 4,
      encodingProgress: processingInfo.encodeProgress || 0,
      status: processingInfo.status,
    };
  },
);

export const deleteVideo = withErrorHandling(
  async (videoId: string, videoThumbPath: string) => {
    // Delete Bunny Stream Video
    const streamDeleteUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`;
    await apiFetch(streamDeleteUrl, {
      method: "DELETE",
      bunnyType: "stream",
    });

    // Delete Thumbnail from Bunny Storage
    await apiFetch(videoThumbPath, {
      method: "DELETE",
      bunnyType: "storage",
      expectJson: false,
    });

    // Delete DB Record
    await db.delete(videos).where(eq(videos.videoId, videoId));

    return {
      success: true,
      message: "Video deleted successfully",
    };
  },
);

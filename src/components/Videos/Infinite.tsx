"use client";

import { useEffect, useRef, useState } from "react";

import { ShieldAlert } from "lucide-react";

import useInfinite from "@/hooks/useInfinite";
import { getVideos } from "@/actions/videos";

import EmptyVideo from "../EmptyVideo";
import VideoItem from "./VideoItem";

type Props = {
  query?: string;
  filter?: string;
};

export default function InfiniteVideos({
  query,
  filter,
  userId,
}: Props & { userId?: string }) {
  const [error, setError] = useState<ActionResultError>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfinite<VideoItem>({
      fn: async (page, limit) => {
        const result = await getVideos(query, filter, page, limit, userId);
        if (result.error) {
          setError(result?.error as ActionResultError);
          throw new Error(result.error.message);
        }
        return result.data ?? [];
      },
      queryKey: ["videos", userId, query, filter],
    });

  const videos = data?.pages.flat() ?? [];
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: "300px" },
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === "pending") {
    return (
      <div className="w-full">
        <p className="mx-4 text-center sm:mx-auto">Loading...</p>
      </div>
    );
  }

  if (error?.type === "server" && error.status == 401) {
    return (
      <EmptyVideo
        path="home"
        title={"You must be authenticated to view other users' videos."}
        icon={<ShieldAlert />}
      />
    );
  }

  if (error?.type === "server" && error.status == 429) {
    return (
      <EmptyVideo path="home" title={error.message} icon={<ShieldAlert />} />
    );
  }

  if (videos.length === 0) {
    return (
      <EmptyVideo
        path="home"
        message={`${!userId ? "No videos have been uploaded yet. Get started by creating your first one." : "This user hasn’t uploaded any videos yet."}`}
      />
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-0.5 lg:grid-cols-2 2xl:grid-cols-4">
        {videos.map((video) => (
          <VideoItem key={video.id} {...{ video }} />
        ))}
      </section>

      {/* Sentinel */}
      <div ref={loadMoreRef} className="h-10" />

      {isFetchingNextPage && (
        <p className="mt-6 text-center text-sm text-neutral-500">
          Loading more...
        </p>
      )}
    </>
  );
}

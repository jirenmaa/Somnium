"use client";

import { useEffect, useRef } from "react";

import useInfinitePins from "@/hooks/useInfiniteScroll";
import { getInfiniteVideos } from "@/lib/actions/video";

import VideoCard from "@/components/VideoCard";
import Empty from "@/components/Empty";

type Props = {
  query?: string;
  filter?: string;
};

export default function InfiniteVideos({ query, filter }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfinitePins({
      fn: (page, limit) => getInfiniteVideos(query, filter, page, limit),
      queryKey: ["videos", query, filter],
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
    return <p className="text-center">Loading videos...</p>;
  }

  if (videos.length === 0) {
    return (
      <Empty
        icon="/assets/icons/video.svg"
        title="No Videos Found"
        description="Try adjusting your search"
      />
    );
  }

  return (
    <>
      <section className="video-grid">
        {videos.map(({ video, user }: any) => (
          <VideoCard
            key={video.id}
            {...video}
            userImg={user?.image || ""}
            username={user?.name || "Guest"}
            thumbnail={video.thumbnailUrl}
          />
        ))}
      </section>

      {/* Sentinel */}
      <div ref={loadMoreRef} className="h-10" />

      {isFetchingNextPage && (
        <p className="text-center text-sm text-neutral-500 mt-6">
          Loading more...
        </p>
      )}
    </>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { deleteVideo } from "@/lib/actions/video";

type Video = {
  id: string;
  title: string;
  thumbnailUrl: string;
  visibility: "public" | "private";
  views: number;
  createdAt: Date;
  videoId: string;
};

type StudioVideo = {
  video: Video;
};

const PAGE_SIZE = 5;

export default function StudioPage({
  initialVideos,
}: {
  initialVideos: StudioVideo[];
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(videos ? videos.length / PAGE_SIZE : 1);

  const paginatedVideos = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    if (videos) {
      return videos.slice(start, start + PAGE_SIZE);
    }
  }, [videos, page]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDelete = async (bunnyVideoId: string, thumbnailUrl: string) => {
    try {
      await deleteVideo(bunnyVideoId, thumbnailUrl);

      // // instantly update UI
      // setVideos((prev) => prev.filter((v) => v.video.videoId !== bunnyVideoId));

      // // if last item deleted on page, move back safely
      // setPage((prev) => {
      //   const newTotal = Math.ceil((videos.length - 1) / PAGE_SIZE);
      //   return prev > newTotal ? Math.max(newTotal, 1) : prev;
      // });
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete video.");
    }
  };

  useEffect(() => setLoading(false), [videos]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-500">Loading studio...</p>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-12 bg-white text-black min-h-[calc(100svh-5rem)]">
      {/* Sidebar */}
      <aside className="sticky top-0 col-span-2 border-r border-gray-200"></aside>

      {/* Content */}
      <section className="col-span-10">
        {/* Header */}
        <header className="border-b border-gray-200 px-6 pt-6">
          <h1 className="text-3xl font-bold pb-3">Channel content</h1>

          <nav className="mt-4 flex gap-8 text-sm text-neutral-500">
            {["Videos", "Shorts", "Live", "Podcasts"].map((tab) => (
              <button
                key={tab}
                className={`pb-2 transition ${
                  tab === "Videos"
                    ? "text-black border-b-2 border-neutral-600 font-medium"
                    : "hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Table */}
        <section className="pt-6 pb-3">
          {/* Table Header */}
          <div className="grid grid-cols-[60px_2fr_160px_160px_120px_120px] text-xs font-semibold text-neutral-500 border-b border-gray-200 pb-3">
            <div />
            <div>Video</div>
            <div>Visibility</div>
            <div>Date (MM/DD/YY)</div>
            <div>Views</div>
            <div className="text-center">Action</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-200">
            {paginatedVideos &&
              paginatedVideos.map(({ video }) => (
                <div
                  key={video.id}
                  className="grid grid-cols-[60px_2fr_160px_160px_120px_120px] items-center py-4 hover:bg-neutral-50 transition"
                >
                  {/* Checkbox */}
                  <div className="px-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(video.id)}
                      onChange={() => toggleSelect(video.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* Video Info */}
                  <div className="flex gap-4 overflow-hidden">
                    {/* Thumbnail */}
                    <div className="relative w-40 h-24 rounded-md overflow-hidden bg-neutral-200 shrink-0">
                      <Image
                        src={video.thumbnailUrl}
                        alt="thumb"
                        fill
                        className="object-cover"
                        loading="eager"
                      />
                    </div>

                    {/* Title */}
                    <div className="overflow-hidden">
                      <h2 className="font-medium text-sm truncate">
                        {video.title}
                      </h2>
                      <p className="text-xs text-neutral-500 truncate">
                        ID: {video.id}
                      </p>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="text-sm capitalize">{video.visibility}</div>

                  {/* Date */}
                  <div className="text-sm">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>

                  {/* Views */}
                  <div className="text-sm">{video.views}</div>

                  {/* Delete Action */}
                  <div className="text-center">
                    <button
                      onClick={() =>
                        handleDelete(video.videoId, video.thumbnailUrl)
                      }
                      className="hover:text-red-600 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#c5c5c5"
                        className="hover:fill-[#ff2e2e] transition-colors"
                      >
                        <path d="M267.33-120q-27.5 0-47.08-19.58-19.58-19.59-19.58-47.09V-740h-7.34q-14.16 0-23.75-9.62-9.58-9.61-9.58-23.83 0-14.22 9.58-23.72 9.59-9.5 23.75-9.5H352q0-14.33 9.58-23.83 9.59-9.5 23.75-9.5h189.34q14.16 0 23.75 9.58 9.58 9.59 9.58 23.75h158.67q14.16 0 23.75 9.62 9.58 9.62 9.58 23.83 0 14.22-9.58 23.72-9.59 9.5-23.75 9.5h-7.34v553.33q0 27.5-19.58 47.09Q720.17-120 692.67-120H267.33Zm130.79-150.67q14.21 0 23.71-9.58t9.5-23.75v-319.33q0-14.17-9.61-23.75-9.62-9.59-23.84-9.59-14.21 0-23.71 9.59-9.5 9.58-9.5 23.75V-304q0 14.17 9.61 23.75 9.62 9.58 23.84 9.58Zm164 0q14.21 0 23.71-9.58t9.5-23.75v-319.33q0-14.17-9.61-23.75-9.62-9.59-23.84-9.59-14.21 0-23.71 9.59-9.5 9.58-9.5 23.75V-304q0 14.17 9.61 23.75 9.62 9.58 23.84 9.58Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Empty */}
          {videos && videos.length === 0 && (
            <p className="text-neutral-500 text-center py-10">No videos yet.</p>
          )}

          {/* Pagination */}
          {videos && videos.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-3 mx-4">
              {/* Info */}
              <p className="text-sm text-neutral-500">
                Page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>

              {/* Controls */}
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-5 py-1.5 bg-neutral-800 hover:bg-neutral-700 transition-colors text-white rounded text-sm disabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-5 py-1.5 bg-neutral-800 hover:bg-neutral-700 transition-colors text-white rounded text-sm disabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

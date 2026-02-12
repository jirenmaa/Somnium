"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { toast } from "sonner";

import { STUDIO_PAGE_SIZE } from "@/constants";
import {
  updateVideoVisibility,
  deleteVideos,
  getMyVideos,
  getMyVideosCount,
} from "@/actions/videos";
import { formatDate, formatDuration } from "@/lib/utils";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import EmptyVideo from "@/components/EmptyVideo";

type Visibility = "public" | "private" | "unlisted";

export default function Client() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [confirmDeleteIds, setConfirmDeleteIds] = useState<string[] | null>(
    null,
  );

  const [pendingVisibility, setPendingVisibility] = useState<{
    videoId: string;
    newValue: Visibility;
  } | null>(null);

  const totalPages = Math.ceil(total / STUDIO_PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      const ids = videos.map((v) => v.id);
      setSelected((prev) => [...new Set([...prev, ...ids])]);
    } else {
      setSelected((prev) =>
        prev.filter((id) => !videos.some((v) => v.id === id)),
      );
    }
  };

  const updateVisibility = async (videoId: string, visibility: Visibility) => {
    await updateVideoVisibility({ videoId, visibility })
      .then(() => {
        toast.success("Video visibility updated!");
      })
      .catch(() => toast.error(`Fail to update video!`));
  };

  const handleConfirm = async () => {
    // Bulk / Single Delete
    if (confirmDeleteIds) {
      const previous = videos;

      try {
        await deleteVideos(confirmDeleteIds).then(() => {
          setVideos((prev) =>
            prev.filter((v) => !confirmDeleteIds.includes(v.id)),
          );

          toast.success(
            `${confirmDeleteIds.length} Video(s) successfully deleted!`,
          );
        });
        setSelected([]);
      } catch {
        setVideos(previous);
        toast.error(`Fail to delete video(s)!`);
      }

      setConfirmDeleteIds(null);
    }

    // Visibility Update
    if (pendingVisibility) {
      const previous = videos;

      setVideos((prev) =>
        prev.map((v) =>
          v.id === pendingVisibility.videoId
            ? { ...v, visibility: pendingVisibility.newValue }
            : v,
        ),
      );

      try {
        await updateVisibility(
          pendingVisibility.videoId,
          pendingVisibility.newValue,
        );
      } catch {
        setVideos(previous);
      }

      setPendingVisibility(null);
    }
  };

  useEffect(() => {
    const fetchMyVideo = async () => {
      setLoading(true)
      const result = await getMyVideos(
        undefined,
        undefined,
        page,
        STUDIO_PAGE_SIZE,
      );
      setVideos(result.data as VideoItem[]);
      setLoading(false)
    };

    fetchMyVideo();
  }, [page]);

  useEffect(() => {
    const fetchMyVideoCount = async () => {
      const total = await getMyVideosCount();
      setTotal(total.data.total);
    };

    fetchMyVideoCount();
  }, []);

  const isDialogOpen = !!confirmDeleteIds || !!pendingVisibility;

  if (loading) {
    return <p className="m-4 md:mx-0 text-center">Loading...</p>
  }

  if (!loading && total === 0 && videos.length === 0) {
    return (
      <EmptyVideo
        path="studio"
        message="You don't have any videos yet. Get started by creating your first video."
      />
    );
  }

  return (
    <section className="pt-6 pb-3">
      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="mx-4 mb-4 flex items-center justify-between rounded-lg bg-neutral-100 px-4 py-2 dark:bg-neutral-900">
          <p className="text-sm">{selected.length} selected</p>

          <button
            onClick={() => setConfirmDeleteIds(selected)}
            className="cursor-pointer rounded bg-red-600 px-4 py-1.5 text-sm text-white"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-[60px_minmax(300px,3fr)_minmax(160px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_100px] overflow-x-scroll border-b border-black/10 pb-3 text-xs font-semibold text-neutral-500 lg:overflow-x-hidden dark:border-white/10">
        <div className="px-4">
          <Checkbox
            checked={
              videos.every((v) => selected.includes(v.id))
                ? true
                : videos.some((v) => selected.includes(v.id))
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(checked) =>
              toggleSelectAllCurrentPage(Boolean(checked))
            }
          />
        </div>
        <div>Video</div>
        <div>Visibility</div>
        <div>Date</div>
        <div>Duration</div>
        <div>Views</div>
        <div className="text-center">Action</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-black/10 dark:divide-white/10">
        {videos.map((video) => (
          <div
            key={video.id}
            className="grid grid-cols-[60px_minmax(300px,3fr)_minmax(160px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_100px] items-center overflow-x-scroll py-4 transition hover:bg-black/5 lg:overflow-x-hidden dark:hover:bg-white/5"
          >
            {/* Checkbox */}
            <div className="px-4">
              <Checkbox
                className="cursor-pointer"
                checked={selected.includes(video.id)}
                onCheckedChange={() => toggleSelect(video.id)}
              />
            </div>

            {/* Video Info */}
            <div className="flex gap-4 overflow-hidden">
              <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-md bg-neutral-200">
                <Image
                  src={video.thumbnailUrl}
                  alt="thumb"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="overflow-hidden">
                <h2 className="truncate text-sm font-medium">{video.title}</h2>
                <p className="hidden truncate text-xs text-neutral-500 lg:block">
                  {video.id}
                </p>
              </div>
            </div>

            {/* Visibility */}
            <Select
              value={video.visibility}
              onValueChange={(value: Visibility) =>
                setPendingVisibility({
                  videoId: video.id,
                  newValue: value,
                })
              }
            >
              <SelectTrigger className="w-28 cursor-pointer text-xs capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-black/10 dark:border-white/10">
                <SelectGroup>
                  <SelectItem value="public" className="cursor-pointer">
                    Public
                  </SelectItem>
                  <SelectItem value="private" className="cursor-pointer">
                    Private
                  </SelectItem>
                  <SelectItem value="unlisted" className="cursor-pointer">
                    Unlisted
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Date */}
            <div className="text-sm">{formatDate(video.createdAt)}</div>

            {/* Duration */}
            <div className="text-sm">{formatDuration(video.duration || 1)}</div>

            {/* Views */}
            <div className="text-sm">{video.views}</div>

            {/* Single Delete */}
            <div className="text-center">
              <button
                onClick={() => setConfirmDeleteIds([video.id])}
                className="cursor-pointer text-red-600 transition hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > STUDIO_PAGE_SIZE && (
        <div className="mx-6 my-3 pb-4 flex items-center justify-between">
          <p className="text-sm">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="cursor-pointer rounded bg-neutral-200 px-5 py-1.5 text-sm disabled:opacity-40 dark:bg-neutral-800 dark:text-white"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer rounded bg-neutral-200 px-5 py-1.5 text-sm disabled:opacity-40 dark:bg-neutral-800 dark:text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDeleteIds(null);
            setPendingVisibility(null);
          }
        }}
      >
        <AlertDialogContent className="border-black/10 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDeleteIds
                ? `Delete ${confirmDeleteIds.length} video(s)?`
                : "Update visibility?"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={handleConfirm}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

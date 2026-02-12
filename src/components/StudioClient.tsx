"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

import { toast } from "sonner";

import { STUDIO_PAGE_SIZE } from "@/constants";
import { updateVideoVisibility, deleteVideos } from "@/actions/videos";
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

type Visibility = "public" | "private" | "unlisted";

export default function Client({ userVideos }: { userVideos: VideoItem[] }) {
  const [videos, setVideos] = useState<VideoItem[]>(userVideos);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [confirmDeleteIds, setConfirmDeleteIds] = useState<string[] | null>(
    null,
  );

  const [pendingVisibility, setPendingVisibility] = useState<{
    videoId: string;
    newValue: Visibility;
  } | null>(null);

  const totalPages = Math.ceil(videos.length / STUDIO_PAGE_SIZE);

  const paginatedVideos = useMemo(() => {
    const start = (page - 1) * STUDIO_PAGE_SIZE;
    return videos.slice(start, start + STUDIO_PAGE_SIZE);
  }, [videos, page]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      const ids = paginatedVideos.map((v) => v.id);
      setSelected((prev) => [...new Set([...prev, ...ids])]);
    } else {
      setSelected((prev) =>
        prev.filter((id) => !paginatedVideos.some((v) => v.id === id)),
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

  const isDialogOpen = !!confirmDeleteIds || !!pendingVisibility;

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
              paginatedVideos.every((v) => selected.includes(v.id))
                ? true
                : paginatedVideos.some((v) => selected.includes(v.id))
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
        {paginatedVideos.map((video) => (
          <div
            key={video.id}
            className="overflow-x-scroll lg:overflow-x-hidden grid grid-cols-[60px_minmax(300px,3fr)_minmax(160px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_100px] items-center py-4 transition hover:bg-black/5 dark:hover:bg-white/5"
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
      {videos.length > STUDIO_PAGE_SIZE && (
        <div className="mx-4 mt-3 flex items-center justify-between">
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

import Link from "next/link";
import Image from "next/image";

import { formatDuration } from "@/lib/utils";

const VideoItem = ({ video }: { video: VideoItem }) => {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="rounded rounded-lg p-2 text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-900"
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden rounded bg-rose-200 sm:h-64 sm:rounded-lg dark:bg-rose-400/20">
        <Image
          src={video.thumbnailUrl}
          alt="thumbnail"
          fill
          className="object-cover transition duration-200 ease-in-out group-hover:scale-[1.01]"
          sizes="(max-width: 640px) 100vw, 350px"
          priority
        />

        {video.duration && (
          <div className="absolute right-2 bottom-2 rounded-md bg-black/30 px-1.5 py-0.5 text-[11px] text-white backdrop-blur-sm">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      <article className="overflow-hidden py-3">
        <div className="flex items-start justify-between">
          <figure className="flex min-w-0 items-start gap-3">
            <Image
              src={video.user.image || "/images/dummy.jpg"}
              alt="avatar"
              width={24}
              height={24}
              className="aspect-square h-8 w-8 shrink-0 rounded-full border border-black/10 sm:h-9 sm:w-9 md:h-10 md:w-10 dark:border-white/10"
            />

            <figcaption className="min-w-0">
              <h2 className="line-clamp-2 text-[0.95rem] leading-snug font-bold break-words text-black dark:text-gray-100">
                {video.title}
              </h2>

              <div className="flex items-center gap-1 text-sm text-neutral-500">
                <h3 className="truncate dark:text-white/60">
                  {video.user.displayUsername || video.user.name}
                </h3>

                <span className="center-dot mt-0.5"></span>

                <span className="pt-0.5 text-xs text-neutral-400 dark:text-white/40">
                  {video.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  })}{" "}
                </span>
              </div>
            </figcaption>
          </figure>

          <aside className="flex w-24 shrink-0 flex-col items-end gap-1">
            <h3 className="rounded bg-neutral-200 px-2 py-0.5 text-[0.7rem] text-neutral-700 capitalize dark:bg-white/10 dark:text-white/80">
              {video.visibility}
            </h3>

            <div className="items-cen?ter flex gap-1 text-xs text-neutral-600 dark:text-white/60">
              <Image
                src="/icons/eye.svg"
                alt="views"
                width={16}
                height={16}
                className="dark:invert"
              />
              <span>{video.views}</span>
            </div>
          </aside>
        </div>
      </article>
    </Link>
  );
};

export default VideoItem;

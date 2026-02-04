"use client";

import Image from "next/image";
import Link from "next/link";

const VideoCard = ({
  id,
  title,
  thumbnail,
  createdAt,
  userImg,
  username,
  views,
  visibility,
  duration,
}: VideoCardProps) => {
  return (
    <Link href={`/video/${id}`} className="video-card group">
      <button onClick={() => {}} className="copy-btn z-[20]">
        <Image src="/assets/icons/link.svg" alt="copy" width={18} height={18} />
      </button>
      <div className="relative rounded-xl overflow-hidden">
        <Image
          src={thumbnail}
          alt="thumbnail"
          width={290}
          height={160}
          className="thumbnail group-hover:scale-[1.05] transition ease-in-out duration-200"
          loading="eager"
        />

        {duration && (
          <div className="duration">{Math.ceil(duration / 60)}min</div>
        )}
      </div>
      <article className="overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          {/* Left section */}
          <figure className="flex items-start gap-2.5 min-w-0">
            <Image
              src={userImg || "/assets/images/dummy.jpg"}
              alt="avatar"
              width={40}
              height={40}
              className="rounded-full aspect-square shrink-0"
            />

            <figcaption className="min-w-0">
              <h2 className="font-bold break-words leading-snug">{title}</h2>

              <h3 className="text-neutral-500 truncate">{username}</h3>

              <span className="text-xs text-neutral-400">
                {createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
            </figcaption>
          </figure>

          {/* Right section */}
          <aside className="w-24 shrink-0 flex flex-col items-end gap-1">
            <h3 className="bg-zinc-100 text-xs px-2 py-1 rounded">
              {visibility}
            </h3>

            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <Image
                src="/assets/icons/eye.svg"
                alt="views"
                width={16}
                height={16}
              />
              <span>{views}</span>
            </div>
          </aside>
        </div>
      </article>
    </Link>
  );
};

export default VideoCard;

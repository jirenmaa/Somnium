"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { toast } from "sonner";

import { daysAgo } from "@/lib/utils";
import Link from "next/link";

const VideoDetailHeader = ({ video }: { video: VideoItem }) => {
  const router = useRouter();

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/videos/${video.id}`,
    );

    setCopied(true);
    toast.success("Link Copied!");
  };

  useEffect(() => {
    const changeChecked = setTimeout(() => {
      if (copied) setCopied(false);
    }, 2000);

    return () => clearTimeout(changeChecked);
  }, [copied]);

  return (
    <header className="my-4 flex flex-col gap-5">
      <div className="flex items-start justify-between flex-row">
        <div className="flex flex-col gap-2.5">
          <h1 className="light:text-dark-100 text-xl md:text-3xl font-bold">
            {video.title}
          </h1>
          <figure className="flex items-center gap-2.5">
            <Link href={`/profile/${video.user.id}`}>
              <button className="cursor-pointer flex items-center gap-2 text-base font-semibold text-gray-100">
                <Image
                  src={video.user.image || ""}
                  alt="user"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </button>
            </Link>

            <figcaption className="flex items-center gap-1.5 text-base font-semibold dark:text-gray-100">
              <Link href={`/profile/${video.user.id}`} className="cursor-pointer">
                <h2>{video.user.displayUsername ?? video.user.name}</h2>
              </Link>
              <span>·</span>
              <span className="text-sm text-gray-400 dark:text-neutral-500">
                {daysAgo(video.createdAt)}
              </span>
            </figcaption>
          </figure>
        </div>
        <button
          onClick={handleCopyLink}
          disabled={copied}
          className={`${copied ? "cursor-not-allowed" : "cursor-pointer"} rounded-full p-2 hover:bg-white/10`}
        >
          <Image
            src={copied ? "/icons/check.svg" : "/icons/link.svg"}
            alt="Copy Link"
            width={24}
            height={24}
            className="dark:invert w-5 h-5 sm:w-auto sm:h-auto"
          />
        </button>
      </div>

      <div className="rounded md:rounded-md bg-black/10 p-2 px-3 sm:px-4 sm:p-4 dark:bg-white/10 text-sm md:text-base whitespace-pre-wrap break-words">
        {video.description}
      </div>
    </header>
  );
};

export default VideoDetailHeader;

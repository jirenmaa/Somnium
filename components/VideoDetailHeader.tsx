"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { daysAgo } from "@/lib/utils";

const VideoDetailHeader = ({
  title,
  createdAt,
  userImg,
  username,
  videoId,
  ownerId,
  visibility,
  thumbnailUrl,
  id
}: VideoDetailHeaderProps) => {
  const router = useRouter();

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/video/${id}`);

    setCopied(true);
  };

  useEffect(() => {
    const changeChecked = setTimeout(() => {
      if (copied) setCopied(false);
    }, 2000);

    return () => clearTimeout(changeChecked);
  }, [copied]);

  return (
    <header className="detail-header">
      <aside className="user-info">
        <h1>{title}</h1>
        <figure>
          <button onClick={() => router.push(`/profile/${ownerId}`)}>
            <Image
              src={userImg || ""}
              alt="user"
              width={32}
              height={32}
              className="rounded-full"
            />
            <h2>{username ?? "Guests"}</h2>
          </button>

          <figcaption>
            <span className="mt-1">·</span>
            <span>{daysAgo(createdAt)}</span>
          </figcaption>
        </figure>
      </aside>
      <aside>
        <button onClick={handleCopyLink}>
          <Image
            src={
              copied ? "/assets/images/checked.png" : "/assets/icons/link.svg"
            }
            alt="Copy Link"
            width={24}
            height={24}
          />
        </button>
      </aside>
    </header>
  );
};

export default VideoDetailHeader;

"use client";

import { useState, useEffect } from "react";

import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { VIDEO_URL_FALLBACK } from "@/constants";

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
  const [status, setStatus] = useState<{ status: number; ok: boolean } | null>(
    null,
  );

  const [thisVideoUrl, setThisVideoUrl] = useState(videoUrl);

  useEffect(() => {
    const getVideoStatus = async () => {
      await fetch(videoUrl).then((res) => {
        setStatus({ status: res.status, ok: res.ok });
      });
    };

    getVideoStatus();
  }, [videoUrl]);

  const playFallbackVideo = () => {
    setThisVideoUrl(VIDEO_URL_FALLBACK);
    setStatus(null);
    toast.success("Playing Fallback Video (Big Buck Bunny)")
  };

  return (
    <div className="flex flex-col gap-7.5 lg:flex-row">
      <div className="flex w-full flex-col gap-6">
        {status && !status.ok && status.status === 403 ? (
          <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-sm bg-[#333] text-white dark:bg-[#000]">
            <ShieldAlert width={100} height={100} className="w-10 h-10 sm:w-20 sm:h-20 md:w-auto md:h-auto" />
            <h3 className="text-base md:text-lg font-semibold">
              Playback temporarily unavailable
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-center text-neutral-400 dark:text-neutral-500 px-4 sm:px-0">
              The video provider is limiting requests right now. Please try
              again in a few days.
            </p>
            <button
              className="cursor-pointer text-xs sm:text-sm underline"
              onClick={playFallbackVideo}
            >
              Try Again Anyway
            </button>
          </div>
        ) : (
          <iframe
            className="relative aspect-video w-full flex-none rounded-sm bg-[#333] dark:bg-[#000]"
            src={thisVideoUrl}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

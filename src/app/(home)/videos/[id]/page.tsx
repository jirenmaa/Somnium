import { VideoOff, LockKeyhole } from "lucide-react";

import { getVideoById } from "@/actions/videos";

import EmptyVideo from "@/components/EmptyVideo";
import VideoPlayer from "@/components/Videos/VideoPlayer";
import VideoDetailHeader from "@/components/Videos/VideoDetailHeader";

export default async function Page({ params }: Params) {
  const { id: videoId } = await params;

  const result: ActionResultType = await getVideoById(videoId);

  if (result.data.type === "private") {
    return (
      <EmptyVideo path="home" title={result.data.message} icon={<LockKeyhole />} />
    );
  }

  if (result.data.type === "notFound") {
    return (
      <EmptyVideo path="home" title={result.data.message} icon={<VideoOff />} />
    );
  }

  return (
    <div className="mx-4 lg:mx-auto my-10 max-w-5xl gap-6">
      <VideoPlayer videoUrl={result.data.videoUrl as string} />
      <VideoDetailHeader video={result.data as VideoItem} />
    </div>
  );
}

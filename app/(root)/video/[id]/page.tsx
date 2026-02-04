import { redirect } from "next/navigation";

import { getVideoById } from "@/lib/actions/video";

import VideoPlayer from "@/components/VideoPlayer";
import VideoDetailHeader from "@/components/VideoDetailHeader";

const Page = async ({ params }: Params) => {
  const { id: videoId } = await params;

  const { user, video } = await getVideoById(videoId);

  if (!video) redirect("/404");

  return (
    <main className="wrapper page !max-w-4xl mx-auto gap-6">
      <section className="video-detail">
        <div className="content">
          <VideoPlayer videoId={video.videoId} />
        </div>
      </section>
      <VideoDetailHeader
        {...video}
        userImg={user?.image}
        username={user?.name}
        ownerId={video.userId}
      />
      <div className="bg-zinc-100 rounded-md p-4">{video.description}</div>
    </main>
  );
};

export default Page;

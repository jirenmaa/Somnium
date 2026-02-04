import { redirect } from "next/navigation";

import { getAllVideosByUser } from "@/lib/actions/video";

import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import Empty from "@/components/Empty";

const Page = async ({ params, searchParams }: ParamsWithSearch) => {
  const { id } = await params;

  const { query, filter } = await searchParams;

  const { user, videos } = await getAllVideosByUser(id, query, filter);

  if (!user) redirect("/404");

  return (
    <div className="wrapper page">
      <Header
        subHeader={user?.name}
        title={`@${user?.name}`}
        userImg={user?.image || "/assets/images/dummy.jpg"}
      />

      {videos?.length > 0 ? (
        <section className="video-grid">
          {videos.map(({ video, user }) => (
            <VideoCard
              key={video.id}
              {...video}
              userImg={user?.image || ""}
              username={user?.name || "Guest"}
              thumbnail={video.thumbnailUrl}
            />
          ))}
        </section>
      ) : (
        <Empty
          icon="/assets/icons/video.svg"
          title="No Videos Available Yet"
          description="Videos will show up one you upload them"
        />
      )}
    </div>
  );
};

export default Page;
